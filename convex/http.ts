import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/internal/jobs/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("x-pixelforge-service");
    if (!secret || secret !== process.env.API_SERVICE_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }
    const body = (await request.json()) as {
      jobId: string;
      status: string;
      progress?: number;
      stage?: string;
      errorCode?: string;
      errorMessage?: string;
      output?: {
        objectKey: string;
        mime: string;
        size: number;
        width?: number;
        height?: number;
        durationMs?: number;
        hasAudio?: boolean;
      };
      mask?: { objectKey: string; mime: string; size: number };
      facesDetected?: number;
      processingMode?: string;
      processingTime?: number;
      processingProvider?: string;
    };
    await ctx.runMutation(internal.jobs.applyProviderUpdate, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

http.route({
  path: "/internal/health",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("x-pixelforge-service");
    if (!secret || secret !== process.env.API_SERVICE_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }
    const body = await request.json();
    await ctx.runMutation(internal.admin.recordProviderHealth, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
