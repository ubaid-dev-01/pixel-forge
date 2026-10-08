import { randomUUID } from "node:crypto";
import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { createJobSchema, describeError } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { requireConvexClient, requireUserId } from "@/lib/server/auth";
import { processImageTool } from "@/lib/server/processImage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(describeError(ERROR_CODES.STORAGE_ERROR), { status: 503 });
    }
    const client = requireConvexClient(request);
    await requireUserId(client);
    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ...describeError(ERROR_CODES.VALIDATION_FAILED), fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { tool, inputFileId, parameters } = parsed.data;
    if (tool.startsWith("video.")) {
      return NextResponse.json(
        {
          errorCode: ERROR_CODES.PROVIDER_UNAVAILABLE,
          userMessage: "Video tools are not available on the Vercel runtime yet.",
          action: "Use image tools, or run the local Python worker for video.",
          retryable: false,
        },
        { status: 503 },
      );
    }

    const created = (await client.mutation(anyApi.jobs.create, {
      tool,
      inputFileId,
      parameters,
      processingProvider: "vercel",
    })) as { jobId: string; cacheHit?: boolean };

    if (created.cacheHit) {
      return NextResponse.json({ jobId: created.jobId, cacheHit: true, status: "completed" }, { status: 202 });
    }

    const input = (await client.query(anyApi.files.get, { fileId: inputFileId })) as {
      objectKey: string;
      mime: string;
    } | null;
    if (!input) {
      return NextResponse.json(describeError(ERROR_CODES.NOT_FOUND), { status: 404 });
    }

    await client.mutation(anyApi.jobs.completeLocal, {
      jobId: created.jobId,
      status: "processing",
      stage: "analyzing",
    });

    const started = Date.now();
    try {
      const blob = await get(input.objectKey, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
      if (!blob?.stream) {
        throw new Error("missing blob");
      }
      const chunks: Buffer[] = [];
      const reader = blob.stream.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(Buffer.from(value));
      }
      const inputBuf = Buffer.concat(chunks);
      const result = await processImageTool(inputBuf, tool, parameters as Record<string, unknown>);
      const outKey = `u/out/${randomUUID()}.${result.mime.split("/")[1] ?? "png"}`;
      await put(outKey, result.buffer, {
        access: "private",
        contentType: result.mime,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      await client.mutation(anyApi.jobs.completeLocal, {
        jobId: created.jobId,
        status: "completed",
        stage: "finalizing",
        processingMode: "classical",
        processingTime: Date.now() - started,
        output: {
          objectKey: outKey,
          mime: result.mime,
          size: result.buffer.length,
          width: result.width,
          height: result.height,
        },
      });
      return NextResponse.json(
        { jobId: created.jobId, cacheHit: false, status: "completed", providerJobId: `vercel-${created.jobId}` },
        { status: 202 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Processing failed";
      await client.mutation(anyApi.jobs.completeLocal, {
        jobId: created.jobId,
        status: "failed",
        errorCode: ERROR_CODES.OUTPUT_FAILED,
        errorMessage: message,
      });
      return NextResponse.json(describeError(ERROR_CODES.OUTPUT_FAILED), { status: 500 });
    }
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(describeError(ERROR_CODES.PROVIDER_UNAVAILABLE), { status: 503 });
  }
}
