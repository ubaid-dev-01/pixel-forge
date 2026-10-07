import { createHmac, timingSafeEqual } from "node:crypto";

export function signPayload(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPayload(secret: string, payload: string, signature: string): boolean {
  const expected = signPayload(secret, payload);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
