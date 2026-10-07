/**
 * Generate Convex Auth JWT keys and set them on the linked deployment.
 * Usage (from repo root): node scripts/setup-convex-auth.mjs
 */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { spawnSync } from "node:child_process";

const deployment = process.env.CONVEX_DEPLOYMENT ?? "dev:necessary-spoonbill-846";

function envSet(name, value) {
  const result = spawnSync("npx", ["convex", "env", "set", name, value], {
    cwd: process.cwd(),
    env: { ...process.env, CONVEX_DEPLOYMENT: deployment },
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    throw new Error(`Failed to set ${name}`);
  }
  console.log(`Set ${name}`);
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

envSet("SITE_URL", "http://localhost:3000");
envSet("JWT_PRIVATE_KEY", privateKey);
envSet("JWKS", jwks);
console.log("Convex Auth env ready. Keep npx convex dev running, then retry sign-up.");
