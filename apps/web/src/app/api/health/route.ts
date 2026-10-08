import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return NextResponse.json({
    ok: true,
    service: "pixelforge-web-api",
    provider: {
      provider: "vercel",
      available: blobReady,
      interpolationAvailable: false,
      models: {},
      reason: blobReady
        ? "Classical image tools run on Vercel (sharp). Video/AI models need a GPU worker."
        : "BLOB_READ_WRITE_TOKEN missing — connect a Vercel Blob store.",
      device: "cpu",
    },
  });
}
