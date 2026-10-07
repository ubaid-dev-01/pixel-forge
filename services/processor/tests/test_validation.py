from pathlib import Path

import pytest
from PIL import Image

from app.errors import ProcessorError
from app.security.magic import assert_safe_image, sniff_kind


def test_rejects_empty_file(tmp_path: Path) -> None:
    path = tmp_path / "x.bin"
    path.write_bytes(b"not-an-image")
    with pytest.raises(ProcessorError) as exc:
        sniff_kind(path)
    assert exc.value.error_code in {"INVALID_FILE", "UNSUPPORTED_FORMAT"}


def test_accepts_png(tmp_path: Path) -> None:
    path = tmp_path / "ok.png"
    Image.new("RGB", (12, 10), (1, 2, 3)).save(path)
    assert sniff_kind(path) == "image"
    assert assert_safe_image(path) == (12, 10)
