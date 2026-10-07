from pathlib import Path

from PIL import Image

from app.image.ops import denoise, encode_image, lanczos_scale, unsharp
from app.security.magic import assert_safe_image


def test_lanczos_scale(tmp_path: Path) -> None:
    source = tmp_path / "in.png"
    Image.new("RGB", (32, 24), (40, 40, 40)).save(source)
    assert_safe_image(source)
    out = lanczos_scale(Image.open(source), 2)
    assert out.size == (64, 48)


def test_sharpen_does_not_explode_range(tmp_path: Path) -> None:
    image = Image.new("RGB", (16, 16), (128, 128, 128))
    sharp = unsharp(image, 0.5, 0.8, 4)
    assert sharp.size == image.size


def test_encode_png(tmp_path: Path) -> None:
    dest = tmp_path / "out.png"
    encode_image(Image.new("RGB", (8, 8), (10, 20, 30)), dest, "png")
    assert dest.exists() and dest.stat().st_size > 0


def test_denoise_preserves_size() -> None:
    image = Image.new("RGB", (48, 48), (90, 90, 90))
    out = denoise(image, "low")
    assert out.size == image.size
