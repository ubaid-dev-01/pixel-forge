from __future__ import annotations

import threading
from pathlib import Path
from typing import Any, Literal

from app.config import settings
from app.errors import ProcessorError

Device = Literal["cpu", "cuda", "mps"]
ModelStatus = Literal["ready", "missing", "loading"]


class ModelRegistry:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._cache: dict[str, Any] = {}
        self._status: dict[str, ModelStatus] = {
            "realesrgan-x4plus": "missing",
            "realesrgan-anime": "missing",
            "gfpgan-1.4": "missing",
            "birefnet": "missing",
            "u2net": "missing",
            "rife": "missing",
        }

    def device(self) -> Device:
        requested = settings.processor_device
        if requested in {"cpu", "cuda", "mps"}:
            if requested != "cpu" and not self._torch_available(requested):
                return "cpu"
            return requested  # type: ignore[return-value]
        if self._torch_available("cuda"):
            return "cuda"
        if self._torch_available("mps"):
            return "mps"
        return "cpu"

    def _torch_available(self, kind: str) -> bool:
        try:
            import torch
        except ImportError:
            return False
        if kind == "cuda":
            return bool(torch.cuda.is_available())
        if kind == "mps":
            return bool(getattr(torch.backends, "mps", None) and torch.backends.mps.is_available())
        return True

    def status_map(self) -> dict[str, ModelStatus]:
        self._probe()
        return dict(self._status)

    def _probe(self) -> None:
        model_dir = Path(settings.processor_model_dir)
        mapping = {
            "realesrgan-x4plus": "RealESRGAN_x4plus.pth",
            "gfpgan-1.4": "GFPGANv1.4.pth",
        }
        for name, filename in mapping.items():
            if (model_dir / filename).exists() or self._importable(name):
                if self._status[name] != "ready":
                    self._status[name] = "missing"
        try:
            import rembg  # noqa: F401

            self._status["u2net"] = "ready" if self._status["u2net"] != "loading" else "loading"
        except ImportError:
            self._status["u2net"] = "missing"

    def _importable(self, name: str) -> bool:
        try:
            if name.startswith("realesrgan"):
                import realesrgan  # noqa: F401
            elif name.startswith("gfpgan"):
                import gfpgan  # noqa: F401
            return True
        except ImportError:
            return False

    def get_realesrgan(self, model: str) -> Any:
        with self._lock:
            key = f"esrgan:{model}"
            if key in self._cache:
                return self._cache[key]
            self._status[model] = "loading"
            try:
                from basicsr.archs.rrdbnet_arch import RRDBNet
                from realesrgan import RealESRGANer
            except ImportError as exc:
                self._status[model] = "missing"
                raise ProcessorError(
                    "MODEL_UNAVAILABLE",
                    "Real-ESRGAN is not installed on this worker. Install the gpu extra or choose Lanczos.",
                ) from exc
            weights = Path(settings.processor_model_dir) / (
                "RealESRGAN_x4plus_anime_6B.pth" if model == "realesrgan-anime" else "RealESRGAN_x4plus.pth"
            )
            if not weights.exists() and not settings.processor_allow_model_download:
                self._status[model] = "missing"
                raise ProcessorError(
                    "MODEL_UNAVAILABLE",
                    "Real-ESRGAN weights are not present and downloads are disabled.",
                )
            net = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            upsampler = RealESRGANer(
                scale=4,
                model_path=str(weights) if weights.exists() else (
                    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
                ),
                model=net,
                tile=0,
                tile_pad=10,
                pre_pad=0,
                half=self.device() == "cuda",
            )
            self._cache[key] = upsampler
            self._status[model] = "ready"
            return upsampler

    def get_gfpgan(self, upscale: int) -> Any:
        with self._lock:
            key = f"gfpgan:{upscale}"
            if key in self._cache:
                return self._cache[key]
            self._status["gfpgan-1.4"] = "loading"
            try:
                from gfpgan import GFPGANer
            except ImportError as exc:
                self._status["gfpgan-1.4"] = "missing"
                raise ProcessorError(
                    "MODEL_UNAVAILABLE",
                    "GFPGAN is not installed on this worker.",
                ) from exc
            weights = Path(settings.processor_model_dir) / "GFPGANv1.4.pth"
            model_path = (
                str(weights)
                if weights.exists()
                else "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth"
            )
            if not weights.exists() and not settings.processor_allow_model_download:
                self._status["gfpgan-1.4"] = "missing"
                raise ProcessorError(
                    "MODEL_UNAVAILABLE",
                    "GFPGAN weights are not present and downloads are disabled.",
                )
            restorer = GFPGANer(
                model_path=model_path,
                upscale=upscale,
                arch="clean",
                channel_multiplier=2,
                bg_upsampler=None,
            )
            self._cache[key] = restorer
            self._status["gfpgan-1.4"] = "ready"
            return restorer

    def remove_background(self, image_bytes: bytes, model: str) -> bytes:
        try:
            from rembg import new_session, remove
        except ImportError as exc:
            raise ProcessorError(
                "MODEL_UNAVAILABLE",
                "Background removal (rembg/U²-Net) is not installed on this worker.",
            ) from exc
        session_name = "u2net" if model != "birefnet" else "u2net"
        if model == "birefnet":
            try:
                session = new_session("birefnet-general")
            except (OSError, ValueError, KeyError):
                session = new_session(session_name)
                self._status["birefnet"] = "missing"
                self._status["u2net"] = "ready"
            else:
                self._status["birefnet"] = "ready"
                return remove(image_bytes, session=session)
        session = new_session(session_name)
        self._status["u2net"] = "ready"
        return remove(image_bytes, session=session)


registry = ModelRegistry()
