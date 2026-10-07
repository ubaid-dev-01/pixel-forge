from pathlib import Path

import filetype
from PIL import Image

from app.config import settings
from app.errors import ProcessorError

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".mkv"}


def sniff_kind(path: Path) -> str:
    kind = filetype.guess(str(path))
    if kind is None:
        suffix = path.suffix.lower()
        if suffix in IMAGE_EXTS:
            return "image"
        if suffix in VIDEO_EXTS:
            return "video"
        raise ProcessorError("INVALID_FILE", "The file could not be identified from its contents.")
    mime = kind.mime
    if mime.startswith("image/"):
        return "image"
    if mime.startswith("video/"):
        return "video"
    raise ProcessorError("UNSUPPORTED_FORMAT", "This file format is not supported.")


def assert_safe_image(path: Path) -> tuple[int, int]:
    Image.MAX_IMAGE_PIXELS = settings.decompression_bomb_pixels
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            width, height = image.size
    except Image.DecompressionBombError as exc:
        raise ProcessorError(
            "DECOMPRESSION_BOMB",
            "The file declared dimensions that are unsafe to decode.",
        ) from exc
    except OSError as exc:
        raise ProcessorError("INVALID_FILE", "The image could not be opened.") from exc
    if width <= 0 or height <= 0:
        raise ProcessorError("INVALID_FILE", "The image has invalid dimensions.")
    if width > settings.max_image_edge or height > settings.max_image_edge:
        raise ProcessorError(
            "DIMENSIONS_TOO_LARGE",
            "Image dimensions exceed the safe processing limit.",
        )
    if width * height > settings.max_image_pixels:
        raise ProcessorError(
            "DIMENSIONS_TOO_LARGE",
            "Image pixel count exceeds the safe processing limit.",
        )
    return width, height
