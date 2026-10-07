from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import shutil
import uuid
from pathlib import Path
from typing import Any

import httpx
import structlog

from app.config import settings
from app.errors import ProcessorError
from app.pipelines import get_pipeline
from app.pipelines.base import PipelineResult
from app.pipelines.video_pipelines import VideoConvertPipeline
from app.schemas.jobs import ProcessJobRequest
from app.security.magic import sniff_kind
from app.storage.signed import download_signed, upload_signed

log = structlog.get_logger()
_cancelled: set[str] = set()
_running: dict[str, str] = {}


def sign_body(body: str) -> str:
    return hmac.new(
        settings.processing_webhook_secret.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


async def notify(webhook_url: str, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, separators=(",", ":"))
    async with httpx.AsyncClient(timeout=20.0) as client:
        await client.post(
            webhook_url,
            content=body,
            headers={
                "content-type": "application/json",
                "x-pixelforge-signature": sign_body(body),
                "authorization": f"Bearer {settings.processor_auth_token}",
            },
        )


async def run_job(request: ProcessJobRequest, provider_job_id: str) -> None:
    workdir = Path(settings.processor_tmp_dir) / provider_job_id
    workdir.mkdir(parents=True, exist_ok=True)
    source = workdir / "input.bin"
    started = asyncio.get_event_loop().time()
    try:
        await notify(
            request.webhook_url,
            {"jobId": request.job_id, "status": "validating", "stage": "preparing"},
        )
        await download_signed(request.input_url, source)
        sniff_kind(source)
        pipeline = get_pipeline(request.tool)
        if provider_job_id in _cancelled:
            raise ProcessorError("CANCELLED", "The job was cancelled before completion.")
        await notify(
            request.webhook_url,
            {"jobId": request.job_id, "status": "processing", "stage": "analyzing"},
        )
        if isinstance(pipeline, VideoConvertPipeline) and hasattr(pipeline, "process_async"):
            pipeline.validate(source, request.parameters)
            result = await pipeline.process_async(source, request.parameters, workdir)
        else:
            pipeline.validate(source, request.parameters)
            result = await asyncio.to_thread(pipeline.process, source, request.parameters, workdir)
        if not result.output_path.exists() or result.output_path.stat().st_size == 0:
            raise ProcessorError("OUTPUT_FAILED", "The processor produced an empty file.")
        await notify(
            request.webhook_url,
            {"jobId": request.job_id, "status": "finalizing", "stage": "finalizing"},
        )
        await upload_signed(request.output_url, result.output_path, result.mime)
        elapsed_ms = int((asyncio.get_event_loop().time() - started) * 1000)
        output_payload = {
            "jobId": request.job_id,
            "status": "completed",
            "stage": "finalizing",
            "processingTime": elapsed_ms,
            "processingMode": result.processing_mode,
            "facesDetected": result.faces_detected,
            "processingProvider": "local",
            "output": {
                "objectKey": str(request.parameters.get("outputObjectKey", result.output_path.name)),
                "mime": result.mime,
                "size": result.output_path.stat().st_size,
                "width": result.width,
                "height": result.height,
                "durationMs": result.duration_ms,
                "hasAudio": result.has_audio,
            },
        }
        await notify(request.webhook_url, output_payload)
    except ProcessorError as exc:
        log.warning("job.failed", job_id=request.job_id, error_code=exc.error_code)
        await notify(
            request.webhook_url,
            {
                "jobId": request.job_id,
                "status": "failed",
                "errorCode": exc.error_code,
                "errorMessage": exc.user_message,
            },
        )
    except Exception:
        log.exception("job.unhandled", job_id=request.job_id)
        await notify(
            request.webhook_url,
            {
                "jobId": request.job_id,
                "status": "failed",
                "errorCode": "OUTPUT_FAILED",
                "errorMessage": "The processor encountered an unexpected failure.",
            },
        )
    finally:
        _running.pop(provider_job_id, None)
        shutil.rmtree(workdir, ignore_errors=True)


def enqueue(request: ProcessJobRequest) -> str:
    provider_job_id = str(uuid.uuid4())
    _running[provider_job_id] = request.job_id
    asyncio.create_task(run_job(request, provider_job_id))
    return provider_job_id


def cancel(provider_job_id: str) -> None:
    _cancelled.add(provider_job_id)
