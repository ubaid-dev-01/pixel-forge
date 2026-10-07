import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const out = resolve(process.cwd(), ".convex-auth-keys.env");
writeFileSync(
  out,
  [
    "# Paste these into Convex Dashboard → Settings → Environment Variables",
    "# Then run: npx convex login && npx convex dev",
    "SITE_URL=http://localhost:3000",
    `JWT_PRIVATE_KEY="${privateKey}"`,
    `JWKS=${jwks}`,
    "",
  ].join("\n"),
  "utf8",
);
console.log(`Wrote ${out}`);
console.log("Open Convex dashboard → Environment Variables and paste SITE_URL, JWT_PRIVATE_KEY, JWKS.");
