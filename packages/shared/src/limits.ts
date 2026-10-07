export const LIMITS = {
  maxImageBytes: 50 * 1024 * 1024,
  maxVideoBytes: 500 * 1024 * 1024,
  maxImagePixels: 40_000_000,
  maxImageEdge: 8192,
  maxUpscaleEdge: 16384,
  decompressionBombPixels: 80_000_000,
  signedUploadTtlSeconds: 900,
  signedDownloadTtlSeconds: 600,
  defaultRetentionHours: 168,
  maxConcurrentJobsPerUser: 2,
} as const;

export const PLAN_LIMITS = {
  free: { imageJobs: 30, videoJobs: 3, bytes: 1 * 1024 * 1024 * 1024 },
  pro: { imageJobs: 500, videoJobs: 40, bytes: 20 * 1024 * 1024 * 1024 },
  team: { imageJobs: 2000, videoJobs: 200, bytes: 100 * 1024 * 1024 * 1024 },
} as const;

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_VIDEO_MIME = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
] as const;

export const MAGIC_IMAGE = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46],
  // AVIF is ISO BMFF; ftyp box is checked in the validator.
} as const;

export function retentionHours(option: "24h" | "7d" | "30d"): number {
  if (option === "24h") return 24;
  if (option === "7d") return 168;
  return 720;
}

export function estimatedUpscaleSize(
  width: number,
  height: number,
  scale: 1 | 2 | 4,
): { width: number; height: number; pixels: number; withinLimit: boolean } {
  const outW = width * scale;
  const outH = height * scale;
  const pixels = outW * outH;
  return {
    width: outW,
    height: outH,
    pixels,
    withinLimit: outW <= LIMITS.maxUpscaleEdge && outH <= LIMITS.maxUpscaleEdge && pixels <= LIMITS.maxImagePixels * 4,
  };
}
