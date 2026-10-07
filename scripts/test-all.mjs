#!/usr/bin/env node
/**
 * Unified PixelForge test runner.
 *
 * Locations this script exercises:
 *   apps/web/src/lib/*.test.ts          vitest — samples, docs, limits
 *   apps/api/src/routes.test.ts         vitest — MIME + HMAC
 *   services/processor/tests/*.py       pytest — image ops + magic bytes
 *   apps/web/public/samples/*.jpg       presence + JPEG signature
 *
 * Usage (from repo root):
 *   npm run test:all
 *   node scripts/test-all.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
let failed = 0;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function run(label, command, args, cwd = root) {
  log(`\n== ${label} ==\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: isWin });
  if (result.status !== 0) {
    log(`FAIL ${label} (exit ${result.status ?? "spawn"})`);
    failed += 1;
    return false;
  }
  log(`PASS ${label}`);
  return true;
}

function findPython() {
  const specs = isWin ? ["py -3.11", "py -3.12", "py", "python", "python3"] : ["python3.11", "python3.12", "python3", "python"];
  for (const spec of specs) {
    const probe = isWin
      ? spawnSync("cmd.exe", ["/c", `${spec} -c print(1)`], { cwd: root, encoding: "utf8" })
      : spawnSync(spec, ["-c", "print(1)"], { cwd: root, encoding: "utf8" });
    if (probe.status === 0) return spec;
  }
  return null;
}

const samples = [
  "chart",
  "grain",
  "product",
  "print",
  "landscape",
  "document",
  "video",
].flatMap((name) => [`${name}-before.jpg`, `${name}-after.jpg`]);

log("== sample JPEG files ==");
for (const name of samples) {
  const file = path.join(root, "apps/web/public/samples", name);
  if (!existsSync(file)) {
    log(`FAIL missing ${file}`);
    failed += 1;
    continue;
  }
  const bytes = readFileSync(file);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.length < 20_000) {
    log(`FAIL invalid JPEG ${file}`);
    failed += 1;
    continue;
  }
  log(`PASS ${name} (${bytes.length} bytes)`);
}

run("web vitest", "npm", ["run", "test", "--workspace=@pixelforge/web"]);
run("api vitest", "npm", ["run", "test", "--workspace=@pixelforge/api"]);

const python = findPython();
if (!python) {
  log("SKIP pytest (Python not found on PATH)");
} else if (isWin) {
  run("processor pytest", "cmd.exe", ["/c", `${python} -m pytest services/processor/tests -q`]);
} else {
  run("processor pytest", python, ["-m", "pytest", "services/processor/tests", "-q"]);
}

if (failed > 0) {
  log(`\n${failed} check(s) failed. Generate samples with: npm run generate:samples`);
  process.exit(1);
}

log("\nAll PixelForge tests passed.");
