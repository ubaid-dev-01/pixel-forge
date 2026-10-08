import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { describeError, presignRequestSchema } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { requireConvexClient, requireUserId } from "@/lib/server/auth";
import { extensionForMime, sanitizeOriginalName } from "@/lib/server/mime";
import { signUploadToken } from "@/lib/server/uploadToken";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 503 });
    }
    const client = requireConvexClient(request);
    const userId = await requireUserId(client);
    const body = await request.json();
    const parsed = presignRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ...describeError(ERROR_CODES.VALIDATION_FAILED), fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { filename, mime, size, kind } = parsed.data;
    const max = kind === "image" ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
    if (size > max) {
      return NextResponse.json(describeError(ERROR_CODES.FILE_TOO_LARGE), { status: 400 });
    }
    const ext = extensionForMime(mime, kind);
    if (!ext) {
      return NextResponse.json(describeError(ERROR_CODES.UNSUPPORTED_FORMAT), { status: 400 });
    }
    const objectKey = `u/${userId}/${kind}/${randomUUID()}.${ext}`;
    const fileId = await client.mutation(anyApi.files.create, {
      objectKey,
      kind,
      role: "input",
      mime,
      size,
      originalName: sanitizeOriginalName(filename),
    });
    const token = signUploadToken({
      objectKey,
      mime,
      exp: Date.now() + 15 * 60 * 1000,
    });
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      fileId,
      objectKey,
      uploadUrl: `${origin}/api/uploads/put?t=${encodeURIComponent(token)}`,
      expiresIn: 900,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 500 });
  }
}
