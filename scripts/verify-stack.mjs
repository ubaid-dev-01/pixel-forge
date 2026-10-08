#!/usr/bin/env node
/**
 * PixelForge stack verification — health + CORS + page smoke + unit tests.
 * Usage: node scripts/verify-stack.mjs
 */
import { spawnSync } from "node:child_process";

const checks = [];
const isWin = process.platform === "win32";
const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://127.0.0.1:8080";
const PROC = process.env.PROCESSOR_URL ?? "http://127.0.0.1:8090";
const S3 = process.env.S3_URL ?? "http://127.0.0.1:9000";

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function getJson(url, init, timeoutMs = 12000) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { response, text, json };
}

async function expectOk(name, url, { timeoutMs = 12000 } = {}) {
  try {
    const { response } = await getJson(url, undefined, timeoutMs);
    if (!response.ok) {
      fail(name, String(response.status));
      return;
    }
    pass(name, String(response.status));
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log("PixelForge stack verify\n");

  // Landing is heavy; allow cold Next compile on first hit
  await expectOk("web home", `${WEB}/`, { timeoutMs: 60000 });
  await expectOk("PWA manifest", `${WEB}/manifest.webmanifest`);
  await expectOk("web tools", `${WEB}/tools`);
  await expectOk("web docs", `${WEB}/docs`);
  await expectOk("web signin", `${WEB}/signin`);
  await expectOk("web signup", `${WEB}/signup`);
  await expectOk("web robots", `${WEB}/robots.txt`);
  await expectOk("tool upscale page", `${WEB}/tools/upscale`);

  // Protected routes should redirect to signin when unauthenticated
  try {
    const response = await fetch(`${WEB}/overview`, {
      redirect: "manual",
      signal: AbortSignal.timeout(12000),
    });
    const loc = response.headers.get("location") ?? "";
    if ([307, 302, 303].includes(response.status) && loc.includes("signin")) {
      pass("auth gate overview", `${response.status} → signin`);
    } else if (response.status === 200) {
      pass("auth gate overview", "200 (demo/open)");
    } else {
      fail("auth gate overview", `status=${response.status} loc=${loc}`);
    }
  } catch (error) {
    fail("auth gate overview", error instanceof Error ? error.message : String(error));
  }

  // API
  try {
    const { response, json } = await getJson(`${API}/api/health`);
    if (response.ok && json?.ok) {
      pass("api health", `provider=${json.provider?.provider} available=${json.provider?.available}`);
    } else fail("api health", String(response.status));
  } catch (error) {
    fail("api health", error instanceof Error ? error.message : String(error));
  }

  try {
    const { response, json } = await getJson(`${API}/api/tools`);
    if (response.ok && (Array.isArray(json) || Array.isArray(json?.tools))) {
      const n = Array.isArray(json) ? json.length : json.tools.length;
      pass("api tools catalog", `${n} tools`);
    } else fail("api tools catalog", String(response.status));
  } catch (error) {
    fail("api tools catalog", error instanceof Error ? error.message : String(error));
  }

  // Processor
  try {
    const { response, json } = await getJson(`${PROC}/health`);
    if (response.ok && json?.available) pass("processor health", `device=${json.device}`);
    else fail("processor health", json?.reason ?? String(response.status));
  } catch (error) {
    fail("processor health", error instanceof Error ? error.message : String(error));
  }

  // S3 CORS preflight — must work on signed-URL-shaped paths (browser real case)
  try {
    const signedShape = `${S3}/pixelforge-media/u/verify/image/cors.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-SignedHeaders=host&x-id=PutObject`;
    const response = await fetch(signedShape, {
      method: "OPTIONS",
      headers: {
        Origin: WEB,
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "content-type",
      },
      signal: AbortSignal.timeout(5000),
    });
    const allowOrigin = response.headers.get("access-control-allow-origin");
    const allowMethods = response.headers.get("access-control-allow-methods") ?? "";
    if ((response.status === 200 || response.status === 204) && allowOrigin && allowMethods.toUpperCase().includes("PUT")) {
      pass("s3 cors", `status=${response.status} origin=${allowOrigin}`);
    } else {
      fail("s3 cors", `status=${response.status} origin=${allowOrigin} methods=${allowMethods}`);
    }
  } catch (error) {
    fail("s3 cors", error instanceof Error ? error.message : String(error));
  }

  // Convex cloud
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://necessary-spoonbill-846.convex.cloud";
  try {
    const response = await fetch(convexUrl, { signal: AbortSignal.timeout(8000) });
    if (response.ok || response.status === 404) pass("convex cloud", String(response.status));
    else fail("convex cloud", String(response.status));
  } catch (error) {
    fail("convex cloud", error instanceof Error ? error.message : String(error));
  }

  // Unit tests
  console.log("\n== unit suites ==");
  const webTest = spawnSync("npm", ["run", "test", "--workspace=@pixelforge/web"], {
    stdio: "inherit",
    shell: isWin,
  });
  if (webTest.status === 0) pass("web vitest");
  else fail("web vitest", `exit ${webTest.status}`);

  const apiTest = spawnSync("npm", ["run", "test", "--workspace=@pixelforge/api"], {
    stdio: "inherit",
    shell: isWin,
  });
  if (apiTest.status === 0) pass("api vitest");
  else fail("api vitest", `exit ${apiTest.status}`);

  const py = spawnSync("py", ["-3.11", "-m", "pytest", "services/processor/tests", "-q"], {
    stdio: "inherit",
    shell: isWin,
  });
  if (py.status === 0) pass("processor pytest");
  else fail("processor pytest", `exit ${py.status}`);

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
  console.log("Stack looks healthy for local demos + unit coverage.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
