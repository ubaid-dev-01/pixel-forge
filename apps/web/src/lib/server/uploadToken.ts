import { createHmac, timingSafeEqual } from "node:crypto";

type UploadPayload = {
  objectKey: string;
  mime: string;
  exp: number;
};

function secret(): string {
  return (
    process.env.UPLOAD_TOKEN_SECRET ??
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.API_SERVICE_SECRET ??
    "pixelforge-dev-upload-secret"
  );
}

export function signUploadToken(payload: UploadPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyUploadToken(token: string): UploadPayload {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("bad token");
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("bad signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as UploadPayload;
  if (payload.exp < Date.now()) throw new Error("expired");
  return payload;
}
