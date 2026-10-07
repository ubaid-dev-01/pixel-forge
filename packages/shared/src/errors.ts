import { ERROR_CODES, type ErrorCode } from "@pixelforge/types";

export interface UserFacingError {
  errorCode: ErrorCode;
  userMessage: string;
  action: string;
  retryable: boolean;
}

const CATALOG: Record<ErrorCode, Omit<UserFacingError, "errorCode">> = {
  UNSUPPORTED_FORMAT: {
    userMessage: "This file format is not supported.",
    action: "Use JPG, PNG, WebP, or AVIF for images; MP4, MOV, or WebM for video.",
    retryable: false,
  },
  FILE_TOO_LARGE: {
    userMessage: "The file exceeds the size limit for your plan.",
    action: "Compress the file or split long video before uploading.",
    retryable: false,
  },
  DIMENSIONS_TOO_LARGE: {
    userMessage: "Image dimensions exceed the safe processing limit.",
    action: "Reduce the longest edge below 8192px and try again.",
    retryable: false,
  },
  INVALID_FILE: {
    userMessage: "The file could not be validated as a real image or video.",
    action: "Re-export the file from a trusted editor and upload again.",
    retryable: false,
  },
  DECOMPRESSION_BOMB: {
    userMessage: "The file declared dimensions that are unsafe to decode.",
    action: "Use a smaller source image. PixelForge will not expand decompression bombs.",
    retryable: false,
  },
  MODEL_UNAVAILABLE: {
    userMessage: "The selected restoration model is not loaded on this worker.",
    action: "Choose a classical pipeline, or wait until the GPU worker has finished downloading models.",
    retryable: true,
  },
  PROCESSING_TIMEOUT: {
    userMessage: "Processing exceeded the allowed time for this job.",
    action: "Try a smaller file, a lower scale, or a shorter clip.",
    retryable: true,
  },
  GPU_UNAVAILABLE: {
    userMessage: "A GPU worker is not available for this job.",
    action: "Retry later, or run the local Python worker with CUDA if you operate your own hardware.",
    retryable: true,
  },
  INSUFFICIENT_USAGE: {
    userMessage: "This job would exceed your monthly processing allowance.",
    action: "Wait for the next period or upgrade when billing is enabled.",
    retryable: false,
  },
  OUTPUT_FAILED: {
    userMessage: "The processor finished but the output file did not pass validation.",
    action: "Retry the job. If it fails again, try a different output format.",
    retryable: true,
  },
  NO_FACES_DETECTED: {
    userMessage: "No faces were detected, so face restoration was not applied.",
    action: "Use photo restoration or upscaling instead of face restoration.",
    retryable: false,
  },
  UNAUTHORIZED: {
    userMessage: "You need to sign in to continue.",
    action: "Sign in and retry the request.",
    retryable: true,
  },
  FORBIDDEN: {
    userMessage: "You do not have access to this resource.",
    action: "Open an item from your own history.",
    retryable: false,
  },
  NOT_FOUND: {
    userMessage: "The requested job or file was not found.",
    action: "Return to history and open a current item.",
    retryable: false,
  },
  RATE_LIMITED: {
    userMessage: "Too many requests in a short period.",
    action: "Wait a moment and try again.",
    retryable: true,
  },
  PROVIDER_UNAVAILABLE: {
    userMessage: "The processing service is not reachable.",
    action: "Start the local Python worker, or continue with labeled sample demos on the marketing pages.",
    retryable: true,
  },
  INTERPOLATION_UNAVAILABLE: {
    userMessage: "True frame interpolation is not enabled on this worker.",
    action: "PixelForge will not duplicate frames. This tool stays unavailable until an interpolation model is configured.",
    retryable: false,
  },
  CANCELLED: {
    userMessage: "The job was cancelled before completion.",
    action: "Start a new job if you still need the result.",
    retryable: true,
  },
  VALIDATION_FAILED: {
    userMessage: "The request did not pass validation.",
    action: "Check the highlighted fields and submit again.",
    retryable: true,
  },
  WEBHOOK_INVALID: {
    userMessage: "The processing callback could not be verified.",
    action: "This is an internal error. Retry the job from history.",
    retryable: true,
  },
  STORAGE_ERROR: {
    userMessage: "Object storage rejected the upload or download.",
    action: "Confirm storage credentials on the API service and retry.",
    retryable: true,
  },
};

export function describeError(code: ErrorCode): UserFacingError {
  return { errorCode: code, ...CATALOG[code] };
}

export function isErrorCode(value: string): value is ErrorCode {
  return Object.values(ERROR_CODES).includes(value as ErrorCode);
}
