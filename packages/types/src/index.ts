export const JOB_STATES = [
  "queued",
  "validating",
  "processing",
  "finalizing",
  "completed",
  "failed",
  "cancelled",
  "expired",
] as const;

export type JobState = (typeof JOB_STATES)[number];

export const PROCESSING_STAGES = [
  "preparing",
  "analyzing",
  "restoring",
  "upsampling",
  "segmenting",
  "compositing",
  "encoding",
  "finalizing",
] as const;

export type ProcessingStage = (typeof PROCESSING_STAGES)[number];

export const TOOLS = {
  IMAGE_UPSCALE: "image.upscale",
  IMAGE_RESTORE: "image.restore",
  FACE_RESTORE: "image.face",
  BACKGROUND_REMOVE: "image.background",
  IMAGE_CLEANUP: "image.cleanup",
  IMAGE_SHARPEN: "image.sharpen",
  IMAGE_DENOISE: "image.denoise",
  IMAGE_COLOR: "image.color",
  IMAGE_CONVERT: "image.convert",
  IMAGE_COMPRESS: "image.compress",
  VIDEO_UPSCALE: "video.upscale",
  VIDEO_DENOISE: "video.denoise",
  VIDEO_SHARPEN: "video.sharpen",
  VIDEO_STABILIZE: "video.stabilize",
  VIDEO_INTERPOLATE: "video.interpolate",
  VIDEO_CONVERT: "video.convert",
  VIDEO_COMPRESS: "video.compress",
  VIDEO_THUMBNAIL: "video.thumbnail",
} as const;

export type ToolId = (typeof TOOLS)[keyof typeof TOOLS];

export const MEDIA_KINDS = ["image", "video"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const IMAGE_FORMATS = ["jpg", "png", "webp", "avif"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export const VIDEO_INPUT_FORMATS = ["mp4", "mov", "webm", "mkv"] as const;
export const VIDEO_OUTPUT_FORMATS = ["mp4", "webm"] as const;
export type VideoOutputFormat = (typeof VIDEO_OUTPUT_FORMATS)[number];

export const PLANS = ["free", "pro", "team"] as const;
export type PlanId = (typeof PLANS)[number];

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROVIDERS = ["local", "replicate", "gpu-worker", "mock"] as const;
export type ProcessingProviderId = (typeof PROVIDERS)[number];

export const RETENTION_OPTIONS = ["24h", "7d", "30d"] as const;
export type RetentionOption = (typeof RETENTION_OPTIONS)[number];

export const ERROR_CODES = {
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  DIMENSIONS_TOO_LARGE: "DIMENSIONS_TOO_LARGE",
  INVALID_FILE: "INVALID_FILE",
  DECOMPRESSION_BOMB: "DECOMPRESSION_BOMB",
  MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE",
  PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
  GPU_UNAVAILABLE: "GPU_UNAVAILABLE",
  INSUFFICIENT_USAGE: "INSUFFICIENT_USAGE",
  OUTPUT_FAILED: "OUTPUT_FAILED",
  NO_FACES_DETECTED: "NO_FACES_DETECTED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  INTERPOLATION_UNAVAILABLE: "INTERPOLATION_UNAVAILABLE",
  CANCELLED: "CANCELLED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  WEBHOOK_INVALID: "WEBHOOK_INVALID",
  STORAGE_ERROR: "STORAGE_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const DEMO_LABELS = ["sample", "preprocessed", "live"] as const;
export type DemoLabel = (typeof DEMO_LABELS)[number];

export interface JobRecord {
  jobId: string;
  userId: string;
  tool: ToolId;
  inputFileId: string;
  outputFileId?: string;
  status: JobState;
  progress?: number;
  stage?: ProcessingStage;
  parameters: Record<string, unknown>;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  errorCode?: ErrorCode;
  errorMessage?: string;
  processingProvider?: ProcessingProviderId;
  processingTime?: number;
  inputDimensions?: { width: number; height: number };
  outputDimensions?: { width: number; height: number };
  inputSize?: number;
  outputSize?: number;
  facesDetected?: number;
  processingMode?: "gpu" | "cpu" | "classical";
}

export interface FileRecord {
  fileId: string;
  userId: string;
  objectKey: string;
  kind: MediaKind;
  mime: string;
  size: number;
  originalName: string;
  width?: number;
  height?: number;
  durationMs?: number;
  frameCount?: number;
  codec?: string;
  hasAudio?: boolean;
  sha256?: string;
  createdAt: number;
  expiresAt: number;
}

export interface ProviderStatus {
  provider: ProcessingProviderId;
  available: boolean;
  device?: "cpu" | "cuda" | "mps";
  models: Record<string, "ready" | "missing" | "loading">;
  interpolationAvailable: boolean;
  reason?: string;
}

export interface UsageSnapshot {
  periodStart: number;
  imageCount: number;
  videoCount: number;
  processingTimeMs: number;
  inputBytes: number;
  outputBytes: number;
  toolUsage: Record<string, number>;
  plan: PlanId;
  imageLimit: number;
  videoLimit: number;
  bytesLimit: number;
}
