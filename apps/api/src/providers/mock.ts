import { randomUUID } from "node:crypto";
import type { ProviderStatus } from "@pixelforge/types";
import type { ProcessJobInput, ProcessingProvider } from "./types.js";

export class MockProvider implements ProcessingProvider {
  readonly id = "mock" as const;
  private readonly jobs = new Map<string, ReturnType<typeof setTimeout>>();

  async status(): Promise<ProviderStatus> {
    return {
      provider: "mock",
      available: true,
      device: "cpu",
      interpolationAvailable: false,
      models: {
        "realesrgan-x4plus": "missing",
        "gfpgan-1.4": "missing",
        birefnet: "missing",
        u2net: "missing",
      },
      reason: "Mock provider is for automated tests. It does not run restoration models.",
    };
  }

  async enqueue(input: ProcessJobInput): Promise<{ providerJobId: string }> {
    const providerJobId = `mock_${randomUUID()}`;
    const timer = setTimeout(() => {
      void fetch(input.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json", "x-pixelforge-job": input.jobId },
        body: JSON.stringify({
          jobId: input.jobId,
          providerJobId,
          status: "failed",
          errorCode: "MODEL_UNAVAILABLE",
          errorMessage:
            "Mock provider does not generate media. Start the Python worker for real processing.",
        }),
      });
    }, 50);
    this.jobs.set(providerJobId, timer);
    return { providerJobId };
  }

  async cancel(providerJobId: string): Promise<void> {
    const timer = this.jobs.get(providerJobId);
    if (timer) clearTimeout(timer);
    this.jobs.delete(providerJobId);
  }
}
