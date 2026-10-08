import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/overview(.*)",
  "/history(.*)",
  "/settings(.*)",
  "/usage(.*)",
  "/presets(.*)",
  "/admin(.*)",
  "/tools/upscale(.*)",
  "/tools/restore(.*)",
  "/tools/face(.*)",
  "/tools/background(.*)",
  "/tools/cleanup(.*)",
  "/tools/sharpen(.*)",
  "/tools/denoise(.*)",
  "/tools/color(.*)",
  "/tools/convert(.*)",
  "/tools/compress(.*)",
  "/tools/video-upscale(.*)",
  "/tools/video-denoise(.*)",
  "/tools/video-sharpen(.*)",
  "/tools/video-stabilize(.*)",
  "/tools/video-interpolate(.*)",
  "/tools/video-convert(.*)",
  "/tools/video-compress(.*)",
  "/tools/video-thumbnail(.*)",
]);

const isSignIn = createRouteMatcher(["/signin", "/signup"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return;
  }
  const path = request.nextUrl.pathname;
  // Never gate Blob upload / job / health routes — only pages + /api/auth.
  if (path.startsWith("/api/") && !path.startsWith("/api/auth")) {
    return;
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
  if (isSignIn(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/overview");
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
