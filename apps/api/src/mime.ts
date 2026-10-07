import { ALLOWED_IMAGE_MIME, ALLOWED_VIDEO_MIME } from "@pixelforge/shared";

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
};

export function extensionForMime(mime: string, kind: "image" | "video"): string | null {
  if (kind === "image") {
    if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(mime)) return null;
    return IMAGE_EXT[mime] ?? null;
  }
  if (!(ALLOWED_VIDEO_MIME as readonly string[]).includes(mime)) return null;
  return VIDEO_EXT[mime] ?? null;
}

export function sanitizeOriginalName(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "upload";
  return base.replace(/[^\w.\- ()]/g, "_").slice(0, 180) || "upload";
}
