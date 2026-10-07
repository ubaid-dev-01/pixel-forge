from typing import Literal

ErrorCode = Literal[
    "UNSUPPORTED_FORMAT",
    "FILE_TOO_LARGE",
    "DIMENSIONS_TOO_LARGE",
    "INVALID_FILE",
    "DECOMPRESSION_BOMB",
    "MODEL_UNAVAILABLE",
    "PROCESSING_TIMEOUT",
    "GPU_UNAVAILABLE",
    "OUTPUT_FAILED",
    "NO_FACES_DETECTED",
    "INTERPOLATION_UNAVAILABLE",
    "CANCELLED",
    "UNAUTHORIZED",
]


class ProcessorError(Exception):
    def __init__(self, error_code: ErrorCode, user_message: str) -> None:
        super().__init__(user_message)
        self.error_code = error_code
        self.user_message = user_message
