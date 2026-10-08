import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { loadEnv } from "./env.js";
import { logger } from "./logger.js";
import { authMiddleware, type AuthedRequest } from "./auth.js";
import { createS3 } from "./storage.js";
import { createProvider } from "./providers/index.js";
import { createRouter } from "./routes.js";

const env = loadEnv();
const s3 = createS3(env);
const provider = createProvider(env);
const app = express();
const router = createRouter({ env, s3, provider });

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.API_CORS_ORIGINS.split(",").map((value) => value.trim()),
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      (req as AuthedRequest & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  }),
);
app.use((req: AuthedRequest, _res, next) => {
  req.requestId = String(req.headers["x-request-id"] ?? randomUUID());
  next();
});
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || req.path.endsWith("/webhooks/provider"),
  }),
);

function maybeAuth(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  if (
    req.path === "/health" ||
    req.path === "/provider" ||
    req.path === "/tools" ||
    req.path === "/webhooks/provider"
  ) {
    next();
    return;
  }
  return authMiddleware(env.CONVEX_URL)(req, res, next);
}

app.use("/api", maybeAuth, router);

// Vercel Express / Services: export the app (no listen). Local `npm run dev` still listens.
export default app;

if (!process.env.VERCEL) {
  const server = app.listen(env.API_PORT, env.API_HOST, () => {
    logger.info({ port: env.API_PORT, provider: env.PROCESSING_PROVIDER }, "api.listening");
  });

  function shutdown(signal: string) {
    logger.info({ signal }, "api.shutdown");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
