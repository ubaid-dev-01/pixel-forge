import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "token",
      "password",
      "signedUrl",
      "url",
    ],
    remove: true,
  },
  base: { service: "pixelforge-api" },
});

export function childLogger(bindings: Record<string, string | undefined>) {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(bindings)) {
    if (value) safe[key] = value;
  }
  return logger.child(safe);
}
