import asyncio
from pathlib import Path

from app.errors import ProcessorError


async def run_ffmpeg(args: list[str], timeout: int = 1800, cwd: Path | None = None) -> None:
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", *args]
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=str(cwd) if cwd else None,
    )
    try:
        _stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
    except TimeoutError as exc:
        process.kill()
        raise ProcessorError("PROCESSING_TIMEOUT", "FFmpeg exceeded the allowed time.") from exc
    if process.returncode != 0:
        message = stderr.decode("utf-8", errors="replace")[-400:]
        raise ProcessorError("OUTPUT_FAILED", f"FFmpeg failed to process the file. {message}")


async def run_ffprobe(path: Path) -> dict[str, str]:
    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration,size,format_name:stream=codec_name,codec_type,width,height,nb_frames",
        "-of",
        "default=noprint_wrappers=1",
        str(path),
    ]
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        raise ProcessorError("INVALID_FILE", "The video could not be probed.")
    data: dict[str, str] = {}
    for line in stdout.decode("utf-8", errors="replace").splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            data[key] = value
    if not data:
        raise ProcessorError("INVALID_FILE", stderr.decode("utf-8", errors="replace")[-200:])
    return data
