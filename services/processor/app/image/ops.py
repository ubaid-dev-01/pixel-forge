from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.errors import ProcessorError


def load_rgb(path: Path) -> Image.Image:
    image = Image.open(path)
    image.load()
    if image.mode not in {"RGB", "RGBA", "L"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    return image


def to_cv(image: Image.Image) -> np.ndarray:
    array = np.array(image.convert("RGB"))
    return cv2.cvtColor(array, cv2.COLOR_RGB2BGR)


def from_cv(array: np.ndarray, alpha: np.ndarray | None = None) -> Image.Image:
    rgb = cv2.cvtColor(array, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(rgb)
    if alpha is not None:
        image = image.convert("RGBA")
        image.putalpha(Image.fromarray(alpha))
    return image


def unsharp(image: Image.Image, amount: float, radius: float, threshold: int) -> Image.Image:
    # Conservative unsharp: blur + thresholded residual.
    rgb = image.convert("RGB")
    blurred = rgb.filter(ImageFilter.GaussianBlur(radius=radius))
    base = np.array(rgb).astype(np.int16)
    blur = np.array(blurred).astype(np.int16)
    residual = base - blur
    mask = np.abs(residual) >= threshold
    sharpened = np.clip(base + residual * amount * mask, 0, 255).astype(np.uint8)
    out = Image.fromarray(sharpened, mode="RGB")
    if image.mode == "RGBA":
        out = out.convert("RGBA")
        out.putalpha(image.getchannel("A"))
    return out


def denoise(image: Image.Image, strength: str) -> Image.Image:
    h_map = {"low": 3, "medium": 6, "high": 10}
    h = h_map.get(strength, 6)
    bgr = to_cv(image)
    restored = cv2.fastNlMeansDenoisingColored(bgr, None, h, h, 7, 21)
    out = from_cv(restored)
    if image.mode == "RGBA":
        out = out.convert("RGBA")
        out.putalpha(image.getchannel("A"))
    return out


def deblock(image: Image.Image) -> Image.Image:
    bgr = to_cv(image)
    restored = cv2.bilateralFilter(bgr, 7, 40, 40)
    return from_cv(restored)


def restore_contrast(image: Image.Image, strength: float = 0.12) -> Image.Image:
    return ImageOps.autocontrast(image.convert("RGB"), cutoff=int(strength * 10))


def apply_color(
    image: Image.Image,
    exposure: float,
    contrast: float,
    saturation: float,
    highlights: float,
    shadows: float,
    temperature: float,
    tint: float,
) -> Image.Image:
    rgb = image.convert("RGB")
    array = np.array(rgb).astype(np.float32)
    array *= 2 ** exposure
    mean = array.mean()
    array = (array - mean) * (1 + contrast / 100) + mean
    array[:, :, 0] += temperature * 0.6
    array[:, :, 2] -= temperature * 0.4
    array[:, :, 1] += tint * 0.4
    luma = array.mean(axis=2, keepdims=True)
    bright = np.clip((luma - 160) / 95, 0, 1)
    dark = np.clip((90 - luma) / 90, 0, 1)
    array += highlights * bright * 0.4
    array += shadows * dark * 0.4
    array = np.clip(array, 0, 255)
    out = Image.fromarray(array.astype(np.uint8), mode="RGB")
    sat = ImageEnhance.Color(out).enhance(1 + saturation / 100)
    if image.mode == "RGBA":
        sat = sat.convert("RGBA")
        sat.putalpha(image.getchannel("A"))
    return sat


def encode_image(image: Image.Image, path: Path, fmt: str, quality: int = 92) -> None:
    fmt = fmt.lower()
    if fmt in {"jpg", "jpeg"}:
        image.convert("RGB").save(path, format="JPEG", quality=quality, optimize=True)
        return
    if fmt == "png":
        image.save(path, format="PNG", optimize=True)
        return
    if fmt == "webp":
        image.save(path, format="WEBP", quality=quality, method=6)
        return
    if fmt == "avif":
        try:
            image.save(path, format="AVIF", quality=quality)
            return
        except OSError as exc:
            raise ProcessorError(
                "UNSUPPORTED_FORMAT",
                "AVIF encoding is not available in this worker build.",
            ) from exc
    raise ProcessorError("UNSUPPORTED_FORMAT", "Unknown output format.")


def lanczos_scale(image: Image.Image, scale: int) -> Image.Image:
    width, height = image.size
    return image.resize((width * scale, height * scale), Image.Resampling.LANCZOS)
