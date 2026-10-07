from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image

from app.errors import ProcessorError
from app.image.ops import (
    apply_color,
    deblock,
    denoise,
    encode_image,
    lanczos_scale,
    load_rgb,
    restore_contrast,
    to_cv,
    unsharp,
)
from app.models.registry import registry
from app.pipelines.base import Pipeline, PipelineResult
from app.security.magic import assert_safe_image


def _fmt(parameters: dict[str, Any]) -> str:
    return str(parameters.get("outputFormat", "png"))


def _out(workdir: Path, fmt: str) -> Path:
    return workdir / f"output.{fmt}"


class ImageUpscalePipeline(Pipeline):
    tool = "image.upscale"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)
        scale = int(parameters.get("scale", 2))
        if scale not in {1, 2, 4}:
            raise ProcessorError("INVALID_FILE", "Scale must be 1x, 2x, or 4x.")

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = load_rgb(source)
        scale = int(parameters.get("scale", 2))
        model = str(parameters.get("model", "lanczos"))
        fmt = _fmt(parameters)
        mode = "classical"
        if model.startswith("realesrgan"):
            upsampler = registry.get_realesrgan(model)
            bgr = to_cv(image)
            tile = int(parameters.get("tileSize", 400))
            upsampler.tile = tile
            output, _ = upsampler.enhance(bgr, outscale=scale)
            result = Image.fromarray(cv2.cvtColor(output, cv2.COLOR_BGR2RGB))
            mode = "gpu" if registry.device() == "cuda" else "cpu"
        else:
            result = lanczos_scale(image, scale)
        dest = _out(workdir, fmt)
        encode_image(result, dest, fmt, int(parameters.get("quality", 92)))
        return PipelineResult(dest, _mime(fmt), result.width, result.height, processing_mode=mode)


class ImageRestorePipeline(Pipeline):
    tool = "image.restore"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        preset = str(parameters.get("preset", "balanced"))
        image = load_rgb(source)
        if preset == "light":
            image = denoise(image, "low")
            image = restore_contrast(image, 0.06)
            image = unsharp(image, 0.35, 0.8, 4)
        elif preset == "strong":
            image = denoise(image, "medium")
            image = deblock(image)
            image = restore_contrast(image, 0.18)
            image = unsharp(image, 0.55, 1.0, 3)
        else:
            image = denoise(image, "low")
            image = deblock(image)
            image = restore_contrast(image, 0.12)
            image = unsharp(image, 0.45, 0.9, 4)
        if parameters.get("faceRestore"):
            try:
                image, faces, mode = _gfpgan(image, 1, 0.5, True)
            except ProcessorError as exc:
                if exc.error_code != "MODEL_UNAVAILABLE":
                    raise
                faces = 0
                mode = "classical"
        else:
            faces = None
            mode = "classical"
        if int(parameters.get("upscale", 1)) == 2:
            image = lanczos_scale(image, 2)
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, faces_detected=faces, processing_mode=mode)


class FaceRestorePipeline(Pipeline):
    tool = "image.face"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = load_rgb(source)
        strength = float(parameters.get("strength", 0.5))
        upscale = int(parameters.get("upscale", 1))
        restore_bg = bool(parameters.get("restoreBackground", True))
        result, faces, mode = _gfpgan(image, upscale, strength, restore_bg)
        if faces == 0:
            raise ProcessorError(
                "NO_FACES_DETECTED",
                "No faces were detected, so face restoration was not applied.",
            )
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(result, dest, fmt)
        return PipelineResult(
            dest,
            _mime(fmt),
            result.width,
            result.height,
            faces_detected=faces,
            processing_mode=mode,
        )


class BackgroundPipeline(Pipeline):
    tool = "image.background"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        model = str(parameters.get("model", "u2net"))
        cut = registry.remove_background(source.read_bytes(), model)
        tmp = workdir / "cut.png"
        tmp.write_bytes(cut)
        cutout = Image.open(tmp).convert("RGBA")
        if parameters.get("edgeRefinement"):
            alpha = np.array(cutout.getchannel("A"))
            alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
            cutout.putalpha(Image.fromarray(alpha))
        output_mode = str(parameters.get("output", "transparent"))
        if output_mode == "solid":
            color = str(parameters.get("backgroundColor", "#ffffff")).lstrip("#")
            rgb = tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))
            bg = Image.new("RGBA", cutout.size, rgb + (255,))
            cutout = Image.alpha_composite(bg, cutout)
        fmt = str(parameters.get("outputFormat", "png"))
        dest = _out(workdir, fmt)
        encode_image(cutout, dest, fmt)
        mask = workdir / "mask.png"
        cutout.getchannel("A").save(mask)
        return PipelineResult(
            dest,
            _mime(fmt),
            cutout.width,
            cutout.height,
            processing_mode="cpu",
            mask_path=mask,
        )


class CleanupPipeline(Pipeline):
    tool = "image.cleanup"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = load_rgb(source)
        if parameters.get("denoise", True):
            image = denoise(image, "low")
        if parameters.get("deblock", True):
            image = deblock(image)
        if parameters.get("contrast", True):
            image = restore_contrast(image)
        if parameters.get("sharpen", True):
            image = unsharp(image, 0.4, 0.8, 5)
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


class SharpenPipeline(Pipeline):
    tool = "image.sharpen"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        presets = {
            "subtle": (0.35, 0.7, 6),
            "balanced": (0.5, 0.9, 4),
            "strong": (0.7, 1.1, 3),
        }
        if "preset" in parameters:
            amount, radius, threshold = presets[str(parameters["preset"])]
        else:
            amount = float(parameters.get("amount", 0.5))
            radius = float(parameters.get("radius", 0.9))
            threshold = int(parameters.get("threshold", 4))
        image = unsharp(load_rgb(source), amount, radius, threshold)
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


class DenoisePipeline(Pipeline):
    tool = "image.denoise"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = denoise(load_rgb(source), str(parameters.get("strength", "medium")))
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


class ColorPipeline(Pipeline):
    tool = "image.color"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = apply_color(
            load_rgb(source),
            float(parameters.get("exposure", 0)),
            float(parameters.get("contrast", 0)),
            float(parameters.get("saturation", 0)),
            float(parameters.get("highlights", 0)),
            float(parameters.get("shadows", 0)),
            float(parameters.get("temperature", 0)),
            float(parameters.get("tint", 0)),
        )
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


class ConvertPipeline(Pipeline):
    tool = "image.convert"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = load_rgb(source)
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        encode_image(image, dest, fmt, int(parameters.get("quality", 90)))
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


class CompressPipeline(Pipeline):
    tool = "image.compress"

    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        assert_safe_image(source)

    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        image = load_rgb(source)
        fmt = _fmt(parameters)
        dest = _out(workdir, fmt)
        quality = int(parameters.get("quality", 80))
        target = parameters.get("targetBytes")
        if target:
            for candidate in range(quality, 20, -5):
                encode_image(image, dest, fmt, candidate)
                if dest.stat().st_size <= int(target):
                    quality = candidate
                    break
        else:
            encode_image(image, dest, fmt, quality)
        return PipelineResult(dest, _mime(fmt), image.width, image.height, processing_mode="classical")


def _mime(fmt: str) -> str:
    return {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "avif": "image/avif",
    }.get(fmt, "application/octet-stream")


def _gfpgan(image: Image.Image, upscale: int, strength: float, restore_bg: bool) -> tuple[Image.Image, int, str]:
    restorer = registry.get_gfpgan(upscale)
    bgr = to_cv(image)
    cropped, restored, output = restorer.enhance(
        bgr,
        has_aligned=False,
        only_center_face=False,
        paste_back=restore_bg,
        weight=strength,
    )
    faces = 0 if cropped is None else len(cropped)
    result = Image.fromarray(cv2.cvtColor(output, cv2.COLOR_BGR2RGB))
    mode = "gpu" if registry.device() == "cuda" else "cpu"
    return result, faces, mode
