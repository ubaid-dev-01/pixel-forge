"""Generate high-contrast, clearly visible synthetic demo PNGs. No stock photos."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "apps" / "web" / "public" / "samples"
BRAND = Path(__file__).resolve().parents[1] / "apps" / "web" / "public" / "brand"
ROOT.mkdir(parents=True, exist_ok=True)
BRAND.mkdir(parents=True, exist_ok=True)


def font(size: int) -> ImageFont.ImageFont:
    for name in ("arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def label(image: Image.Image, text: str, accent: tuple[int, int, int] = (201, 163, 106)) -> None:
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, image.width, 36), fill=(10, 10, 11))
    draw.text((16, 10), text, fill=accent, font=font(14))


def save(image: Image.Image, name: str) -> None:
    path = ROOT / name
    image.save(path, format="PNG", optimize=True)
    print(path)


def chart(sharp: bool) -> Image.Image:
    w, h = 960, 640
    image = Image.new("RGB", (w, h), (18, 18, 22) if sharp else (48, 46, 42))
    draw = ImageDraw.Draw(image)
    cx, cy = w // 2, h // 2 + 8
    step = 10 if sharp else 28
    color = (236, 232, 220) if sharp else (140, 132, 118)
    for radius in range(20, 290, step):
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=color, width=2 if sharp else 1)
    draw.line((40, cy, w - 40, cy), fill=(201, 163, 106), width=2 if sharp else 1)
    draw.line((cx, 50, cx, h - 24), fill=(201, 163, 106), width=2 if sharp else 1)
    if not sharp:
        image = image.filter(ImageFilter.GaussianBlur(2.4))
        image = ImageEnhance.Contrast(image).enhance(0.72)
    label(image, "PREPROCESSED · ZONE PLATE" if sharp else "SAMPLE · DEGRADED ZONE PLATE")
    return image


def portrait(restored: bool) -> Image.Image:
    w, h = 720, 900
    bg = (22, 20, 18) if restored else (62, 54, 46)
    image = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(image)
    skin = (214, 186, 158) if restored else (118, 98, 82)
    shirt = (92, 78, 64) if restored else (64, 54, 46)
    draw.ellipse((210, 150, 510, 520), fill=skin)
    draw.rectangle((230, 500, 490, 880), fill=shirt)
    eye = (32, 26, 22) if restored else (40, 34, 30)
    draw.ellipse((290, 280, 340, 330), fill=eye)
    draw.ellipse((380, 280, 430, 330), fill=eye)
    draw.arc((320, 360, 400, 430), 20, 160, fill=eye, width=6 if restored else 3)
    if not restored:
        pixels = image.load()
        rng = random.Random(7)
        for _ in range(18000):
            x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
            tone = pixels[x, y]
            n = rng.randint(-28, 28)
            pixels[x, y] = tuple(max(0, min(255, c + n)) for c in tone)
        image = image.filter(ImageFilter.GaussianBlur(1.1))
    label(image, "PREPROCESSED · DENOISED" if restored else "SAMPLE · GRAIN + COMPRESSION")
    return image


def product(cutout: bool) -> Image.Image:
    w, h = 900, 700
    if cutout:
        image = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        for y in range(0, h, 24):
            for x in range(0, w, 24):
                if (x // 24 + y // 24) % 2 == 0:
                    draw.rectangle((x, y, x + 24, y + 24), fill=(36, 36, 40, 255))
                else:
                    draw.rectangle((x, y, x + 24, y + 24), fill=(22, 22, 24, 255))
    else:
        image = Image.new("RGBA", (w, h), (74, 110, 64, 255))
        draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((300, 160, 600, 560), radius=8, fill=(220, 210, 196, 255))
    draw.rectangle((330, 190, 570, 390), fill=(20, 20, 22, 255))
    draw.rectangle((360, 430, 540, 455), fill=(201, 163, 106, 255))
    out = image.convert("RGB")
    label(out, "SAMPLE · TRANSPARENT CUTOUT" if cutout else "SAMPLE · PRODUCT ON FIELD")
    return out


def print_pair(restored: bool) -> Image.Image:
    w, h = 1000, 700
    paper = (236, 228, 210) if restored else (186, 154, 96)
    image = Image.new("RGB", (w, h), (16, 16, 18) if restored else (92, 74, 42))
    draw = ImageDraw.Draw(image)
    draw.rectangle((70, 70, 930, 630), fill=paper)
    ink = (28, 28, 30) if restored else (122, 98, 58)
    for i, width in enumerate((760, 640, 700, 500)):
        y = 160 + i * 70
        draw.rectangle((140, y, 140 + width, y + 18), fill=ink)
    draw.rectangle((140, 470, 420, 580), fill=(48, 72, 52) if restored else (140, 118, 70))
    if not restored:
        image = ImageEnhance.Color(image).enhance(0.55)
        image = ImageEnhance.Contrast(image).enhance(0.7)
    label(image, "PREPROCESSED · TONAL REPAIR" if restored else "SAMPLE · FADED PRINT")
    return image


def landscape(sharp: bool) -> Image.Image:
    w, h = 960, 540
    image = Image.new("RGB", (w, h), (72, 110, 148) if sharp else (96, 108, 112))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 320, w, h), fill=(46, 78, 48) if sharp else (70, 78, 62))
    draw.polygon([(80, 320), (280, 140), (460, 320)], fill=(90, 96, 88) if sharp else (110, 108, 96))
    draw.ellipse((680, 70, 780, 170), fill=(242, 214, 120) if sharp else (168, 150, 96))
    if not sharp:
        image = image.filter(ImageFilter.GaussianBlur(2.8))
        image = ImageEnhance.Sharpness(image).enhance(0.2)
    label(image, "PREPROCESSED · UPSCALED DETAIL" if sharp else "SAMPLE · LOW-RESOLUTION LANDSCAPE")
    return image


def document(clean: bool) -> Image.Image:
    w, h = 800, 1000
    image = Image.new("RGB", (w, h), (248, 246, 240) if clean else (210, 200, 178))
    draw = ImageDraw.Draw(image)
    ink = (24, 24, 26) if clean else (90, 78, 60)
    draw.text((48, 64), "FIELD NOTES  /  14.03", fill=ink, font=font(28))
    for i in range(12):
        y = 140 + i * 62
        draw.line((48, y, w - 48, y), fill=(200, 196, 188) if clean else (176, 160, 132), width=1)
        draw.rectangle((48, y - 22, 48 + (520 if i % 3 else 380), y - 8), fill=ink)
    if not clean:
        rng = random.Random(3)
        pixels = image.load()
        for _ in range(12000):
            x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
            pixels[x, y] = tuple(max(0, min(255, c + rng.randint(-40, 18))) for c in pixels[x, y])
        image = image.filter(ImageFilter.GaussianBlur(0.7))
    labeled = image.convert("RGB")
    label(labeled, "PREPROCESSED · DOCUMENT CLEANUP" if clean else "SAMPLE · STAINED SCAN")
    return labeled


def video_frame(enhanced: bool) -> Image.Image:
    w, h = 960, 540
    image = Image.new("RGB", (w, h), (20, 24, 32) if enhanced else (28, 28, 30))
    draw = ImageDraw.Draw(image)
    for i in range(12):
        x = 40 + i * 76
        shade = 180 - i * 8 if enhanced else 90 - i * 4
        draw.rectangle((x, 120, x + 54, 420), fill=(shade, shade + 10, shade + 20))
    if not enhanced:
        image = image.filter(ImageFilter.GaussianBlur(1.6))
    label(image, "PREPROCESSED · VIDEO FRAME SHARPEN" if enhanced else "SAMPLE · SOFT VIDEO FRAME")
    return image


def brand_pngs() -> None:
    def mark(size: int, path: Path) -> None:
        im = Image.new("RGB", (size, size), (10, 10, 11))
        d = ImageDraw.Draw(im)
        m = int(size * 0.18)
        d.rectangle((m, m, size - m, size - m), outline=(242, 240, 234), width=max(2, size // 42))
        s = max(6, size // 9)
        x = size - m - s * 2 - 4
        y = size - m - s * 2 - 4
        d.rectangle((x, y, x + s, y + s), fill=(201, 163, 106))
        im.save(path)

    mark(32, BRAND / "favicon.png")
    mark(512, BRAND / "app-icon.png")
    og = Image.new("RGB", (1200, 630), (10, 10, 11))
    d = ImageDraw.Draw(og)
    d.rectangle((80, 80, 1120, 550), outline=(42, 42, 46), width=1)
    d.rectangle((120, 250, 148, 278), fill=(201, 163, 106))
    d.text((180, 240), "PIXELFORGE", fill=(242, 240, 234), font=font(48))
    d.text((180, 330), "Restore the detail your images lost.", fill=(154, 151, 144), font=font(28))
    og.save(BRAND / "og-image.png")


def main() -> None:
    save(chart(False), "chart-before.png")
    save(chart(True), "chart-after.png")
    save(portrait(False), "grain-before.png")
    save(portrait(True), "grain-after.png")
    save(product(False), "product-before.png")
    save(product(True), "product-after.png")
    save(print_pair(False), "print-before.png")
    save(print_pair(True), "print-after.png")
    save(landscape(False), "landscape-before.png")
    save(landscape(True), "landscape-after.png")
    save(document(False), "document-before.png")
    save(document(True), "document-after.png")
    save(video_frame(False), "video-before.png")
    save(video_frame(True), "video-after.png")
    brand_pngs()
    print("samples ready")


if __name__ == "__main__":
    main()
