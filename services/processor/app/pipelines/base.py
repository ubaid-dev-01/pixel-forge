from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class PipelineResult:
    output_path: Path
    mime: str
    width: int | None = None
    height: int | None = None
    duration_ms: int | None = None
    has_audio: bool | None = None
    faces_detected: int | None = None
    processing_mode: str = "cpu"
    mask_path: Path | None = None
    stage: str = "finalizing"


class Pipeline(ABC):
    tool: str

    @abstractmethod
    def validate(self, source: Path, parameters: dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    def process(self, source: Path, parameters: dict[str, Any], workdir: Path) -> PipelineResult:
        raise NotImplementedError
