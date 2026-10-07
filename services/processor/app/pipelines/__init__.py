from typing import Any

from app.errors import ProcessorError
from app.pipelines.base import Pipeline
from app.pipelines.image_pipelines import (
    BackgroundPipeline,
    CleanupPipeline,
    ColorPipeline,
    CompressPipeline,
    ConvertPipeline,
    DenoisePipeline,
    FaceRestorePipeline,
    ImageRestorePipeline,
    ImageUpscalePipeline,
    SharpenPipeline,
)
from app.pipelines.video_pipelines import (
    VideoCompressPipeline,
    VideoConvertPipeline,
    VideoDenoisePipeline,
    VideoInterpolatePipeline,
    VideoSharpenPipeline,
    VideoStabilizePipeline,
    VideoThumbnailPipeline,
    VideoUpscalePipeline,
)

PIPELINES: dict[str, Pipeline] = {
    "image.upscale": ImageUpscalePipeline(),
    "image.restore": ImageRestorePipeline(),
    "image.face": FaceRestorePipeline(),
    "image.background": BackgroundPipeline(),
    "image.cleanup": CleanupPipeline(),
    "image.sharpen": SharpenPipeline(),
    "image.denoise": DenoisePipeline(),
    "image.color": ColorPipeline(),
    "image.convert": ConvertPipeline(),
    "image.compress": CompressPipeline(),
    "video.upscale": VideoUpscalePipeline(),
    "video.denoise": VideoDenoisePipeline(),
    "video.sharpen": VideoSharpenPipeline(),
    "video.stabilize": VideoStabilizePipeline(),
    "video.interpolate": VideoInterpolatePipeline(),
    "video.convert": VideoConvertPipeline(),
    "video.compress": VideoCompressPipeline(),
    "video.thumbnail": VideoThumbnailPipeline(),
}


def get_pipeline(tool: str) -> Pipeline:
    pipeline = PIPELINES.get(tool)
    if pipeline is None:
        raise ProcessorError("UNSUPPORTED_FORMAT", f"Unknown tool {tool}.")
    return pipeline
