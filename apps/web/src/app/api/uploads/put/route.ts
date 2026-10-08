import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { describeError } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { verifyUploadToken } from "@/lib/server/uploadToken";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("t");
    if (!token) {
      return NextResponse.json(describeError(ERROR_CODES.UNAUTHORIZED), { status: 401 });
    }
    const payload = verifyUploadToken(token);
    const bytes = Buffer.from(await request.arrayBuffer());
    if (!bytes.length) {
      return NextResponse.json(describeError(ERROR_CODES.VALIDATION_FAILED), { status: 400 });
    }
    await put(payload.objectKey, bytes, {
      access: "private",
      contentType: payload.mime,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}
