/**
 * Set clean Convex Auth JWT keys + SITE_URL on production (no CR in values).
 * Usage: node scripts/setup-convex-auth-prod.mjs
 */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SITE_URL = process.env.SITE_URL ?? "https://pixelforge-phi-nine.vercel.app";
const convex = resolve(
  process.cwd(),
  process.platform === "win32" ? "node_modules/.bin/convex.cmd" : "node_modules/.bin/convex",
);

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\r?\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

function envSet(name, value) {
  const result = spawnSync(convex, ["env", "set", name, "--prod"], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
    windowsHide: true,
    input: `${value}\n`,
  });
  if (result.status !== 0) {
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    throw new Error(`Failed to set ${name}`);
  }
  console.log(`Set ${name} on production`);
}

envSet("SITE_URL", SITE_URL);
envSet("JWT_PRIVATE_KEY", privateKey);
envSet("JWKS", jwks);
console.log(`Convex Auth production ready. SITE_URL=${SITE_URL}`);
