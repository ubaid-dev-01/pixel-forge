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
};

export function extensionForMime(mime: string, kind: "image" | "video"): string | null {
  if (kind === "image") return IMAGE_EXT[mime] ?? null;
  return VIDEO_EXT[mime] ?? null;
}

export function sanitizeOriginalName(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "upload";
  return base.replace(/[^\w.\- ()]/g, "_").slice(0, 180) || "upload";
}
