from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    processor_host: str = "0.0.0.0"
    processor_port: int = 8090
    processor_device: str = "auto"
    processor_model_dir: str = "./model_cache"
    processor_tmp_dir: str = "./tmp"
    processor_max_concurrency: int = 1
    processor_job_timeout_seconds: int = 1800
    processor_auth_token: str = "change-me-processor-token"
    processor_allow_model_download: int = 1
    processing_webhook_secret: str = "change-me-in-production-use-a-long-random-string"
    max_image_pixels: int = 40_000_000
    max_image_edge: int = 8192
    decompression_bomb_pixels: int = 80_000_000


settings = Settings()
