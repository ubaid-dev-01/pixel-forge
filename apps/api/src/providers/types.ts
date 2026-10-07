import type { ProcessingProviderId, ProviderStatus, ToolId } from "@pixelforge/types";

export interface ProcessJobInput {
  jobId: string;
  tool: ToolId;
  parameters: Record<string, unknown>;
  inputUrl: string;
  outputUrl: string;
  maskUrl?: string;
  webhookUrl: string;
}

export interface ProcessingProvider {
  readonly id: ProcessingProviderId;
  status(): Promise<ProviderStatus>;
  enqueue(input: ProcessJobInput): Promise<{ providerJobId: string }>;
  cancel(providerJobId: string): Promise<void>;
}
