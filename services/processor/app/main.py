from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse

from app.config import settings
from app.errors import ProcessorError
from app.models.registry import registry
from app.schemas.jobs import EnqueueResponse, HealthResponse, ProcessJobRequest
from app.workers.runner import cancel, enqueue


async def require_token(authorization: str | None = Header(default=None)) -> None:
    if not authorization or authorization != f"Bearer {settings.processor_auth_token}":
        raise HTTPException(status_code=401, detail={"errorCode": "UNAUTHORIZED", "userMessage": "Invalid processor token."})


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Path = __import__("pathlib").Path
    Path(settings.processor_tmp_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.processor_model_dir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="PixelForge Processor", lifespan=lifespan)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    device = registry.device()
    models = registry.status_map()
    return HealthResponse(
        available=True,
        device=device,
        interpolationAvailable=models.get("rife") == "ready",
        models=models,
        reason=None if models.get("gfpgan-1.4") == "ready" else "Classical tools are available. GFPGAN/Real-ESRGAN load on first use if installed.",
    )


@app.post("/jobs", response_model=EnqueueResponse, dependencies=[Depends(require_token)])
async def create_job(body: ProcessJobRequest) -> EnqueueResponse:
    provider_job_id = enqueue(body)
    return EnqueueResponse(providerJobId=provider_job_id)


@app.post("/jobs/{provider_job_id}/cancel", dependencies=[Depends(require_token)])
async def cancel_job(provider_job_id: str) -> dict[str, bool]:
    cancel(provider_job_id)
    return {"cancelled": True}


@app.exception_handler(ProcessorError)
async def processor_error(_request: object, exc: ProcessorError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"errorCode": exc.error_code, "userMessage": exc.user_message},
    )
