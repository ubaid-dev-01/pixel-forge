"""
Download high-resolution Unsplash photos (free license) and build
before/after demo pairs for the landing page.

We fetch ~4K masters (web-safe). True 8K files would add hundreds of MB
and hurt LCP — the after frames stay sharp enough for retina displays.
"""
from __future__ import annotations

import io
import random
import urllib.request
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "apps" / "web" / "public" / "samples"
ROOT.mkdir(parents=True, exist_ok=True)

# Stable Unsplash CDN IDs — free to use under Unsplash License.
SOURCES: dict[str, str] = {
    # Sharp landscape for upscaler demo
    "landscape": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=3840&q=90",
    # Portrait for grain / restoration
    "grain": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=2400&q=90",
    # Product / object for cutout
    "product": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=2400&q=90",
    # Warm / faded print feel (architectural detail works for tonal repair)
    "print": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=3840&q=90",
    # Detail / texture standing in for resolution chart
    "chart": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=3840&q=90",
    # Paper / notebook for document cleanup
    "document": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2400&q=90",
    # Cinematic frame for video sharpen
    "video": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=3840&q=90",
}

UA = "PixelForgeSampleFetcher/1.0 (local demo assets; Unsplash License)"


def fetch(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as response:
        data = response.read()
    image = Image.open(io.BytesIO(data))
    image.load()
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGB")
    return image


def fit(image: Image.Image, max_edge: int = 2560) -> Image.Image:
    """Cap longest edge for web weight while keeping a high-res look."""
    w, h = image.size
    longest = max(w, h)
    if longest <= max_edge:
        return image.convert("RGB") if image.mode != "RGB" else image
    scale = max_edge / longest
    size = (max(1, int(w * scale)), max(1, int(h * scale)))
    return image.convert("RGB").resize(size, Image.Resampling.LANCZOS)


def degrade_blur(image: Image.Image, soft: float = 2.2) -> Image.Image:
    small = image.resize((max(1, image.width // 4), max(1, image.height // 4)), Image.Resampling.BILINEAR)
    soft_img = small.resize(image.size, Image.Resampling.BILINEAR)
    soft_img = soft_img.filter(ImageFilter.GaussianBlur(soft))
    soft_img = ImageEnhance.Contrast(soft_img).enhance(0.82)
    soft_img = ImageEnhance.Color(soft_img).enhance(0.88)
    return soft_img


def degrade_grain(image: Image.Image) -> Image.Image:
    base = degrade_blur(image, 1.4)
    pixels = base.load()
    rng = random.Random(11)
    w, h = base.size
    for _ in range(min(80_000, w * h // 8)):
        x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
        tone = pixels[x, y]
        n = rng.randint(-36, 36)
        pixels[x, y] = tuple(max(0, min(255, c + n)) for c in tone)
    # JPEG-like blockiness
    buf = io.BytesIO()
    base.save(buf, format="JPEG", quality=28)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


def degrade_fade(image: Image.Image) -> Image.Image:
    faded = ImageEnhance.Color(image).enhance(0.45)
    faded = ImageEnhance.Contrast(faded).enhance(0.7)
    faded = ImageEnhance.Brightness(faded).enhance(1.08)
    overlay = Image.new("RGB", faded.size, (186, 154, 96))
    return Image.blend(faded, overlay, 0.18)


def degrade_document(image: Image.Image) -> Image.Image:
    stained = ImageEnhance.Contrast(image).enhance(0.75)
    stained = ImageEnhance.Color(stained).enhance(0.7)
    stained = stained.filter(ImageFilter.GaussianBlur(0.8))
    pixels = stained.load()
    rng = random.Random(3)
    w, h = stained.size
    for _ in range(min(40_000, w * h // 12)):
        x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
        pixels[x, y] = tuple(max(0, min(255, c + rng.randint(-40, 18))) for c in pixels[x, y])
    return stained


def product_cutout(image: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Before = product on scene. After = same framing on checkerboard (aligned for slider)."""
    before = fit(image, 2000)
    w, h = before.size

    # Checkerboard fills the full canvas — same size as before.
    board = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(board)
    cell = max(16, w // 80)
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            fill = (229, 229, 227) if ((x // cell) + (y // cell)) % 2 == 0 else (245, 245, 244)
            draw.rectangle((x, y, x + cell, y + cell), fill=fill)

    # Soft oval mask over the product — keeps 1:1 pixel alignment with `before`.
    # Honest demo cutout (not live BiRefNet); subject is never rescaled or recentered.
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    pad_x, pad_y = int(w * 0.12), int(h * 0.08)
    mask_draw.ellipse((pad_x, pad_y, w - pad_x, h - pad_y), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(max(8, w // 120)))

    after = Image.composite(before, board, mask)
    return before, after


def save_pair(name: str, before: Image.Image, after: Image.Image) -> None:
    before_path = ROOT / f"{name}-before.jpg"
    after_path = ROOT / f"{name}-after.jpg"
    before.save(before_path, format="JPEG", quality=82, optimize=True)
    after.save(after_path, format="JPEG", quality=90, optimize=True)
    print(f"{name}: {before.size[0]}x{before.size[1]} -> {before_path.name} / {after_path.name}")


def main() -> None:
    print("Downloading high-resolution Unsplash photos…")

    chart = fit(fetch(SOURCES["chart"]))
    save_pair("chart", degrade_blur(chart, 2.8), chart)

    grain = fit(fetch(SOURCES["grain"]), 2000)
    save_pair("grain", degrade_grain(grain), grain)

    product_src = fetch(SOURCES["product"])
    before, after = product_cutout(product_src)
    save_pair("product", before, after)

    print_img = fit(fetch(SOURCES["print"]))
    save_pair("print", degrade_fade(print_img), print_img)

    landscape = fit(fetch(SOURCES["landscape"]))
    save_pair("landscape", degrade_blur(landscape, 3.0), landscape)

    document = fit(fetch(SOURCES["document"]), 2000)
    save_pair("document", degrade_document(document), document)

    video = fit(fetch(SOURCES["video"]))
    save_pair("video", degrade_blur(video, 2.0), video)

    print("samples ready (Unsplash License — preprocessed demos, not live model output)")


if __name__ == "__main__":
    main()
