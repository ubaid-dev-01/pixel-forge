import sharp from "sharp";

export async function processImageTool(
  input: Buffer,
  tool: string,
  parameters: Record<string, unknown>,
): Promise<{ buffer: Buffer; mime: string; width: number; height: number }> {
  let image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const fmt = String(parameters.outputFormat ?? "png");

  if (tool === "image.upscale") {
    const scale = Number(parameters.scale ?? 2);
    const w = Math.max(1, Math.round((meta.width ?? 1) * scale));
    const h = Math.max(1, Math.round((meta.height ?? 1) * scale));
    image = image.resize(w, h, { kernel: "lanczos3" });
  } else if (tool === "image.restore" || tool === "image.cleanup") {
    image = image.normalize().modulate({ brightness: 1.02, saturation: 1.05 }).sharpen({ sigma: 0.8 });
    if (Number(parameters.upscale) === 2 && meta.width && meta.height) {
      image = image.resize(meta.width * 2, meta.height * 2, { kernel: "lanczos3" });
    }
  } else if (tool === "image.sharpen") {
    image = image.sharpen({ sigma: Number(parameters.radius ?? 0.9) });
  } else if (tool === "image.denoise") {
    image = image.median(3).blur(0.3);
  } else if (tool === "image.color") {
    image = image.modulate({
      brightness: 1 + Number(parameters.exposure ?? 0) / 100,
      saturation: 1 + Number(parameters.saturation ?? 0) / 100,
    });
  } else if (tool === "image.convert" || tool === "image.compress") {
    // format decided below
  } else if (tool === "image.face" || tool === "image.background") {
    // Classical fallback — light enhance until GPU models are wired on Vercel.
    image = image.normalize().sharpen({ sigma: 0.6 });
  } else if (tool.startsWith("video.")) {
    throw new Error("VIDEO_NOT_SUPPORTED_ON_VERCEL");
  } else {
    image = image.normalize();
  }

  const quality = Number(parameters.quality ?? 90);
  let buffer: Buffer;
  let mime = "image/png";
  if (fmt === "jpg" || fmt === "jpeg") {
    buffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    mime = "image/jpeg";
  } else if (fmt === "webp") {
    buffer = await image.webp({ quality }).toBuffer();
    mime = "image/webp";
  } else if (fmt === "avif") {
    buffer = await image.avif({ quality }).toBuffer();
    mime = "image/avif";
  } else {
    buffer = await image.png().toBuffer();
    mime = "image/png";
  }

  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    mime,
    width: outMeta.width ?? meta.width ?? 0,
    height: outMeta.height ?? meta.height ?? 0,
  };
}
