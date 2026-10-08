import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { describeError } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { requireConvexClient, requireUserId } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
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
    const blob = await get(file.objectKey, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const downloadUrl = blob?.blob?.downloadUrl ?? blob?.blob?.url;
    if (!downloadUrl) {
      return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 404 });
    }
    return NextResponse.json({
      downloadUrl,
      filename: file.originalName,
      mime: file.mime,
      expiresIn: 600,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 500 });
  }
}
