import type { ApiEnv } from "../env.js";
import { HttpProcessingProvider } from "./httpProvider.js";
import { MockProvider } from "./mock.js";
import type { ProcessingProvider } from "./types.js";

export function createProvider(env: ApiEnv): ProcessingProvider {
  if (env.PROCESSING_PROVIDER === "mock") {
    return new MockProvider();
  }
  // Prefer live process.env so Vercel Services bindings win at runtime.
  const url = process.env.PROCESSING_PROVIDER_URL ?? env.PROCESSING_PROVIDER_URL;
  const token = process.env.PROCESSING_PROVIDER_TOKEN ?? env.PROCESSING_PROVIDER_TOKEN;
  if (!url || !token) {
    return new MockProvider();
  }
  const id =
    env.PROCESSING_PROVIDER === "replicate"
      ? "replicate"
      : env.PROCESSING_PROVIDER === "gpu-worker"
        ? "gpu-worker"
        : "local";
  return new HttpProcessingProvider(id, url, token);
}

export type { ProcessingProvider, ProcessJobInput } from "./types.js";
