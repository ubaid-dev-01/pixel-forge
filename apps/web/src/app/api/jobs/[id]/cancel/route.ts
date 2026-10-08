import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { describeError } from "@pixelforge/shared";
import { ERROR_CODES } from "@pixelforge/types";
import { requireConvexClient, requireUserId } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const client = requireConvexClient(request);
    await requireUserId(client);
    const { id } = await context.params;
    const result = await client.mutation(anyApi.jobs.requestCancel, { jobId: id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(describeError(ERROR_CODES.PROVIDER_UNAVAILABLE), { status: 503 });
  }
}
