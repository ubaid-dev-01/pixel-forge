import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

export function requireConvexClient(request: Request): ConvexHttpClient {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ errorCode: "UNAUTHORIZED", userMessage: "Sign in required." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const token = header.slice("Bearer ".length).trim();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Response(JSON.stringify({ errorCode: "PROVIDER_UNAVAILABLE", userMessage: "Convex is not configured." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(token);
  return client;
}

export async function requireUserId(client: ConvexHttpClient): Promise<string> {
  const me = (await client.query(anyApi.users.me, {})) as { userId?: string } | null;
  if (!me?.userId) {
    throw new Response(JSON.stringify({ errorCode: "UNAUTHORIZED", userMessage: "Sign in required." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  await client.mutation(anyApi.users.ensureProfile, {});
  return me.userId;
}
