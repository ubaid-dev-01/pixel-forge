/**
 * Read .convex-auth-keys.env and set JWT_PRIVATE_KEY + JWKS on Convex (no stdout of secrets).
 * Uses --from-file so PEM values are never parsed as CLI flags.
 * Run: node scripts/apply-auth-keys.mjs
 */
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const path = resolve(process.cwd(), ".convex-auth-keys.env");
const text = readFileSync(path, "utf8");
const values = {};
for (const line of text.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i === -1) continue;
  const key = line.slice(0, i);
  let val = line.slice(i + 1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  values[key] = val;
}

const tmp = mkdtempSync(join(tmpdir(), "pixelforge-auth-"));
try {
  for (const key of ["JWT_PRIVATE_KEY", "JWKS"]) {
    if (!values[key]) throw new Error(`Missing ${key} in .convex-auth-keys.env`);
    const file = join(tmp, `${key}.txt`);
    writeFileSync(file, values[key], "utf8");
    const result = spawnSync(
      "npx.cmd",
      ["convex", "env", "set", key, "--from-file", file],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        windowsHide: true,
      },
    );
    if (result.status !== 0) {
      console.error(result.error?.message || result.stderr || result.stdout || "(no output)");
      throw new Error(`Failed to set ${key}`);
    }
    console.log(`Set ${key}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log("Auth keys applied. Retry sign-up.");
