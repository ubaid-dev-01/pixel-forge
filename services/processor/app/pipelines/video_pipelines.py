from __future__ import annotations

from pathlib import Path
from typing import Any

from app.errors import ProcessorError
from app.pipelines.base import Pipeline, PipelineResult
from app.security.ffmpeg import run_ffmpeg, run_ffprobe


def _video_meta(probe: dict[str, str]) -> tuple[int | None, int | None, int | None, bool | None]:
    width = int(probe["width"]) if probe.get("width", "N/A") not in {"N/A", ""} else None
    height = int(probe["height"]) if probe.get("height", "N/A") not in {"N/A", ""} else None
    duration = probe.get("duration", "N/A")
    duration_ms = int(float(duration) * 1000) if duration not in {"N/A", ""} else None
    has_audio = probe.get("codec_type") == "audio" or True
    return width, height, duration_ms, has_audio


class VideoConvertPipeline(Pipeline):
    tool = "video.convert"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        return None

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        fmt = str(parameters.get("outputFormat", "mp4"))
        dest = workdir / f"output.{fmt}"
        if fmt == "webm":
            args = ["-i", str(source), "-c:v", "libvpx-vp9", "-c:a", "libopus", "-y", str(dest)]
            mime = "video/webm"
        else:
            args = ["-i", str(source), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", "-y", str(dest)]
            mime = "video/mp4"
        await run_ffmpeg(args)
        probe = await run_ffprobe(dest)
        width, height, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, mime, width, height, duration_ms, has_audio, processing_mode="classical")

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        raise ProcessorError("OUTPUT_FAILED", "Video pipelines must run asynchronously.")


class VideoDenoisePipeline(VideoConvertPipeline):
    tool = "video.denoise"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        strength = str(parameters.get("strength", "medium"))
        luma = {"low": 2, "medium": 4, "high": 8}[strength]
        dest = workdir / "output.mp4"
        await run_ffmpeg(
            [
                "-i",
                str(source),
                "-vf",
                f"hqdn3d={luma}:{luma}:{3}:{3}",
                "-c:a",
                "copy",
                "-y",
                str(dest),
            ]
        )
        probe = await run_ffprobe(dest)
        width, height, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, "video/mp4", width, height, duration_ms, has_audio, processing_mode="classical")


class VideoSharpenPipeline(VideoConvertPipeline):
    tool = "video.sharpen"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        amount = {"low": 0.3, "medium": 0.5, "high": 0.7}[str(parameters.get("strength", "medium"))]
        dest = workdir / "output.mp4"
        await run_ffmpeg(
            [
                "-i",
                str(source),
                "-vf",
                f"unsharp=5:5:{amount}:5:5:0.0",
                "-c:a",
                "copy",
                "-y",
                str(dest),
            ]
        )
        probe = await run_ffprobe(dest)
        width, height, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, "video/mp4", width, height, duration_ms, has_audio, processing_mode="classical")


class VideoStabilizePipeline(VideoConvertPipeline):
    tool = "video.stabilize"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        shakiness = {"low": 5, "medium": 8, "high": 10}[str(parameters.get("strength", "medium"))]
        transforms = workdir / "transforms.trf"
        dest = workdir / "output.mp4"
        await run_ffmpeg(["-i", str(source), "-vf", f"vidstabdetect=shakiness={shakiness}:result={transforms.name}", "-f", "null", "-"])
        await run_ffmpeg(
            [
                "-i",
                str(source),
                "-vf",
                f"vidstabtransform=input={transforms.name}:smoothing=10,unsharp=5:5:0.4:5:5:0.0",
                "-c:a",
                "copy",
                "-y",
                str(dest),
            ]
        )
        probe = await run_ffprobe(dest)
        width, height, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, "video/mp4", width, height, duration_ms, has_audio, processing_mode="classical")


class VideoCompressPipeline(VideoConvertPipeline):
    tool = "video.compress"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        crf = str(int(parameters.get("crf", 28)))
        dest = workdir / "output.mp4"
        await run_ffmpeg(
            ["-i", str(source), "-c:v", "libx264", "-crf", crf, "-preset", "medium", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-y", str(dest)]
        )
        probe = await run_ffprobe(dest)
        width, height, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, "video/mp4", width, height, duration_ms, has_audio, processing_mode="classical")


class VideoThumbnailPipeline(VideoConvertPipeline):
    tool = "video.thumbnail"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        mode = str(parameters.get("mode", "single"))
        dest = workdir / "output.png"
        if mode == "contact-sheet":
            await run_ffmpeg(["-i", str(source), "-vf", "select=not(mod(n\\,30)),scale=320:-1,tile=3x3", "-frames:v", "1", "-y", str(dest)])
        else:
            ts = int(parameters.get("timestampMs", 1000)) / 1000
            await run_ffmpeg(["-ss", str(ts), "-i", str(source), "-frames:v", "1", "-y", str(dest)])
        from PIL import Image

        with Image.open(dest) as image:
            width, height = image.size
        return PipelineResult(dest, "image/png", width, height, processing_mode="classical")


class VideoUpscalePipeline(VideoConvertPipeline):
    tool = "video.upscale"

    async def process_async(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        model = str(parameters.get("model", "ffmpeg-scale"))
        if model != "ffmpeg-scale":
            raise ProcessorError(
                "MODEL_UNAVAILABLE",
                "AI video upscaling requires a GPU worker with Real-ESRGAN. Use the FFmpeg scale option or attach a GPU provider.",
            )
        target = str(parameters.get("target", "1080p"))
        height = {"720p": 720, "1080p": 1080, "4k": 2160}[target]
        dest = workdir / "output.mp4"
        await run_ffmpeg(
            [
                "-i",
                str(source),
                "-vf",
                f"scale=-2:{height}:flags=lanczos",
                "-c:a",
                "copy",
                "-y",
                str(dest),
            ]
        )
        probe = await run_ffprobe(dest)
        width, height_out, duration_ms, has_audio = _video_meta(probe)
        return PipelineResult(dest, "video/mp4", width, height_out, duration_ms, has_audio, processing_mode="classical")


class VideoInterpolatePipeline(Pipeline):
    tool = "video.interpolate"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        raise ProcessorError(
            "INTERPOLATION_UNAVAILABLE",
            "True frame interpolation is not enabled on this worker. PixelForge will not duplicate frames.",
        )

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        raise ProcessorError(
            "INTERPOLATION_UNAVAILABLE",
            "True frame interpolation is not enabled on this worker.",
        )
