from typing import Any, Literal

from pydantic import BaseModel, Field


class ProcessJobRequest(BaseModel):
    job_id: str = Field(alias="jobId")
    tool: str
    parameters: dict[str, Any]
    input_url: str = Field(alias="inputUrl")
    output_url: str = Field(alias="outputUrl")
    mask_url: str | None = Field(default=None, alias="maskUrl")
    webhook_url: str = Field(alias="webhookUrl")

    model_config = {"populate_by_name": True}


class HealthResponse(BaseModel):
    provider: Literal["local"] = "local"
    available: bool
    device: Literal["cpu", "cuda", "mps"] | None = None
    interpolation_available: bool = Field(alias="interpolationAvailable")
    models: dict[str, Literal["ready", "missing", "loading"]]
    reason: str | None = None

    model_config = {"populate_by_name": True}


class EnqueueResponse(BaseModel):
    provider_job_id: str = Field(alias="providerJobId")

    model_config = {"populate_by_name": True}
