import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(8080),
  API_HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.string().default("info"),
  CONVEX_URL: z.string().url(),
  CONVEX_SITE_URL: z.string().url().optional(),
  API_SERVICE_SECRET: z.string().min(16),
  API_CORS_ORIGINS: z.string().default("http://localhost:3000"),
  OBJECT_STORAGE_ENDPOINT: z.string().url(),
  OBJECT_STORAGE_REGION: z.string().default("us-east-1"),
  OBJECT_STORAGE_BUCKET: z.string().min(1),
  OBJECT_STORAGE_ACCESS_KEY: z.string().min(1),
  OBJECT_STORAGE_SECRET_KEY: z.string().min(1),
  OBJECT_STORAGE_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  SIGNED_UPLOAD_TTL_SECONDS: z.coerce.number().default(900),
  SIGNED_DOWNLOAD_TTL_SECONDS: z.coerce.number().default(600),
  PROCESSING_PROVIDER: z.enum(["local", "replicate", "gpu-worker", "mock"]).default("local"),
  // Injected by Vercel Services binding, or set manually for local/dev.
  PROCESSING_PROVIDER_URL: z.string().min(1).optional(),
  PROCESSING_PROVIDER_TOKEN: z.string().optional(),
  PROCESSING_WEBHOOK_SECRET: z.string().min(16),
  API_PUBLIC_URL: z.string().min(1).default("http://localhost:8080"),
  MAX_IMAGE_BYTES: z.coerce.number().default(50 * 1024 * 1024),
  MAX_VIDEO_BYTES: z.coerce.number().default(500 * 1024 * 1024),
});

export type ApiEnv = z.infer<typeof schema>;

let cached: ApiEnv | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  if (cached && source === process.env) return cached;
  const parsed = schema.safeParse({
    ...source,
    API_SERVICE_SECRET: source.API_SERVICE_SECRET ?? source.PROCESSING_WEBHOOK_SECRET,
  });
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid API environment: ${details}`);
  }
  if (source === process.env) cached = parsed.data;
  return parsed.data;
}
