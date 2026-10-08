/**
 * Local S3-compatible store for PixelForge (no Docker required).
 * - Registers minioadmin credentials (matches apps/api/.env)
 * - Answers OPTIONS preflight with 204 before s3rver auth (browser CORS)
 * Run: node scripts/start-local-s3.mjs
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const S3rver = require("s3rver");
const AWSAccount = require("s3rver/lib/models/account");

// Match apps/api/.env — s3rver only ships S3RVER/S3RVER by default.
AWSAccount.DUMMY_ACCOUNT.createKeyPair("minioadmin", "minioadmin");
AWSAccount.DUMMY_ACCOUNT.createKeyPair("S3RVER", "S3RVER");

const directory = resolve(process.cwd(), "tools", "s3-data");
mkdirSync(directory, { recursive: true });

const corsXml = readFileSync(resolve(process.cwd(), "scripts", "s3-cors.xml"));

const s3rver = new S3rver({
  silent: false,
  directory,
  allowMismatchedSignatures: true,
  configureBuckets: [
    {
      name: "pixelforge-media",
      configs: [corsXml],
    },
  ],
});

const middleware = s3rver.getMiddleware();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, HEAD, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "ETag, x-amz-request-id, x-amz-version-id",
  "Access-Control-Max-Age": "3000",
};

const server = createServer((req, res) => {
  // Browser preflight hits the signed PUT URL; s3rver auth would 403 it.
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (statusCode, statusMessage, headers) => {
    let code = statusCode;
    let msg = statusMessage;
    let hdrs = headers;
    if (typeof statusMessage === "object") {
      hdrs = statusMessage;
      msg = undefined;
    }
    const merged = { ...CORS, ...(hdrs ?? {}) };
    if (msg === undefined) return originalWriteHead(code, merged);
    return originalWriteHead(code, msg, merged);
  };

  middleware(req, res, (err) => {
    if (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(500, CORS);
        res.end("Local S3 error");
      }
    }
  });
});

server.listen(9000, "127.0.0.1", async () => {
  try {
    await s3rver.configureBuckets();
  } catch (error) {
    console.warn("configureBuckets:", error instanceof Error ? error.message : error);
  }
  console.log("Local S3 listening on http://127.0.0.1:9000 (bucket: pixelforge-media, CORS+minioadmin)");
});
