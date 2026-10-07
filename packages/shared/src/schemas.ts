import { z } from "zod";
import { IMAGE_FORMATS, JOB_STATES, TOOLS, VIDEO_OUTPUT_FORMATS } from "@pixelforge/types";

export const toolIdSchema = z.enum([
  TOOLS.IMAGE_UPSCALE,
  TOOLS.IMAGE_RESTORE,
  TOOLS.FACE_RESTORE,
  TOOLS.BACKGROUND_REMOVE,
  TOOLS.IMAGE_CLEANUP,
  TOOLS.IMAGE_SHARPEN,
  TOOLS.IMAGE_DENOISE,
  TOOLS.IMAGE_COLOR,
  TOOLS.IMAGE_CONVERT,
  TOOLS.IMAGE_COMPRESS,
  TOOLS.VIDEO_UPSCALE,
  TOOLS.VIDEO_DENOISE,
  TOOLS.VIDEO_SHARPEN,
  TOOLS.VIDEO_STABILIZE,
  TOOLS.VIDEO_INTERPOLATE,
  TOOLS.VIDEO_CONVERT,
  TOOLS.VIDEO_COMPRESS,
  TOOLS.VIDEO_THUMBNAIL,
]);

export const jobStateSchema = z.enum(JOB_STATES);

export const imageFormatSchema = z.enum(IMAGE_FORMATS);
export const videoOutputSchema = z.enum(VIDEO_OUTPUT_FORMATS);

export const upscaleParamsSchema = z.object({
  scale: z.union([z.literal(1), z.literal(2), z.literal(4)]),
  model: z.enum(["realesrgan-x4plus", "realesrgan-anime", "lanczos"]),
  tileSize: z.union([z.literal(0), z.literal(128), z.literal(256), z.literal(400), z.literal(512)]),
  denoise: z.number().min(0).max(1).optional(),
  outputFormat: imageFormatSchema,
  quality: z.number().int().min(1).max(100),
});

export const restoreParamsSchema = z.object({
  preset: z.enum(["light", "balanced", "strong"]),
  faceRestore: z.boolean(),
  upscale: z.union([z.literal(1), z.literal(2)]),
  outputFormat: imageFormatSchema,
});

export const faceParamsSchema = z.object({
  strength: z.number().min(0).max(1),
  upscale: z.union([z.literal(1), z.literal(2)]),
  restoreBackground: z.boolean(),
  outputFormat: imageFormatSchema,
});

export const backgroundParamsSchema = z.object({
  model: z.enum(["birefnet", "u2net"]),
  category: z.enum(["portrait", "product", "object", "general"]),
  output: z.enum(["transparent", "solid", "image"]),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  edgeRefinement: z.boolean(),
  outputFormat: z.enum(["png", "webp"]),
});

export const cleanupParamsSchema = z.object({
  denoise: z.boolean(),
  deblock: z.boolean(),
  sharpen: z.boolean(),
  contrast: z.boolean(),
  colorCast: z.boolean(),
  outputFormat: imageFormatSchema,
});

export const sharpenParamsSchema = z.object({
  preset: z.enum(["subtle", "balanced", "strong"]).optional(),
  amount: z.number().min(0).max(3),
  radius: z.number().min(0.3).max(4),
  threshold: z.number().min(0).max(20),
  outputFormat: imageFormatSchema,
});

export const denoiseParamsSchema = z.object({
  strength: z.enum(["low", "medium", "high"]),
  outputFormat: imageFormatSchema,
});

export const colorParamsSchema = z.object({
  exposure: z.number().min(-2).max(2),
  contrast: z.number().min(-50).max(50),
  saturation: z.number().min(-50).max(50),
  highlights: z.number().min(-50).max(50),
  shadows: z.number().min(-50).max(50),
  temperature: z.number().min(-50).max(50),
  tint: z.number().min(-50).max(50),
  outputFormat: imageFormatSchema,
});

export const convertParamsSchema = z.object({
  outputFormat: imageFormatSchema,
  quality: z.number().int().min(1).max(100),
});

export const compressParamsSchema = z.object({
  outputFormat: imageFormatSchema,
  quality: z.number().int().min(1).max(100),
  targetBytes: z.number().int().positive().optional(),
});

export const videoEnhanceParamsSchema = z.object({
  target: z.enum(["720p", "1080p", "4k"]),
  model: z.enum(["realesrgan-x4plus", "ffmpeg-scale"]),
  outputFormat: videoOutputSchema,
});

export const videoFilterParamsSchema = z.object({
  strength: z.enum(["low", "medium", "high"]),
  outputFormat: videoOutputSchema,
});

export const videoConvertParamsSchema = z.object({
  outputFormat: videoOutputSchema,
});

export const videoCompressParamsSchema = z.object({
  outputFormat: videoOutputSchema,
  preset: z.enum(["draft", "balanced", "delivery"]),
  codec: z.enum(["h264", "vp9"]),
  crf: z.number().int().min(16).max(36),
  targetBitrateKbps: z.number().int().positive().optional(),
});

export const videoThumbnailParamsSchema = z.object({
  mode: z.enum(["single", "contact-sheet", "best-frame"]),
  timestampMs: z.number().int().nonnegative().optional(),
});

export const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mime: z.string().min(1).max(127),
  size: z.number().int().positive(),
  kind: z.enum(["image", "video"]),
});

export const createJobSchema = z.object({
  tool: toolIdSchema,
  inputFileId: z.string().min(1),
  parameters: z.record(z.unknown()),
});
