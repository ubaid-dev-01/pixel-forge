import { ERROR_CODES, type ProcessingProviderId, type ProviderStatus } from "@pixelforge/types";
import type { ProcessJobInput, ProcessingProvider } from "./types.js";

export class HttpProcessingProvider implements ProcessingProvider {
  constructor(
    public readonly id: ProcessingProviderId,
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  async status(): Promise<ProviderStatus> {
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/health`, {
        headers: { authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) {
        return {
          provider: this.id,
          available: false,
          interpolationAvailable: false,
          models: {},
          reason: "Provider health endpoint returned an error.",
        };
      }
      return (await response.json()) as ProviderStatus;
    } catch {
      return {
        provider: this.id,
        available: false,
        interpolationAvailable: false,
        models: {},
        reason: "Processing worker is not reachable.",
      };
    }
  }

  async enqueue(input: ProcessJobInput): Promise<{ providerJobId: string }> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/jobs`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(ERROR_CODES.PROVIDER_UNAVAILABLE);
    }
    return (await response.json()) as { providerJobId: string };
  }

  async cancel(providerJobId: string): Promise<void> {
    await fetch(`${this.baseUrl.replace(/\/$/, "")}/jobs/${encodeURIComponent(providerJobId)}/cancel`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}` },
    });
  }
}
