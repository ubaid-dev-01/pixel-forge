import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { describeError } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { contentDispositionHeader, downloadFilename } from "@/lib/download";
import { requireConvexClient, requireUserId } from "@/lib/server/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 503 });
    }
    const client = requireConvexClient(request);
    await requireUserId(client);
    const { id } = await context.params;
    const file = (await client.query(anyApi.files.get, { fileId: id })) as {
      objectKey: string;
      originalName: string;
      mime: string;
    } | null;
    if (!file) {
      return NextResponse.json(describeError(ERROR_CODES.NOT_FOUND), { status: 404 });
    }
    // Private store URLs (including ?download=1) return 400/403 in the browser.
    // Stream the bytes with the read token so the dashboard never embeds that URL.
    const blob = await get(file.objectKey, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!blob?.stream) {
      return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 404 });
    }
    const mime = blob.blob.contentType || file.mime || "application/octet-stream";
    const filename = downloadFilename(file.originalName || "output", mime);
    return new NextResponse(blob.stream, {
      status: 200,
      headers: {
        "content-type": mime,
        "content-disposition": contentDispositionHeader(filename),
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 500 });
  }
}
