export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "note"; title?: string; text: string }
  | { type: "warn"; title?: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocPage = {
  slug: string;
  title: string;
  summary: string;
  section: string;
  blocks: DocBlock[];
};

export const DOC_SECTIONS = [
  "Start here",
  "Tools",
  "Platform",
  "Operate",
] as const;

export const DOC_PAGES: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Run PixelForge locally, first with the marketing site, then with real processing.",
    section: "Start here",
    blocks: [
      { type: "p", text: "PixelForge is a multi-service restoration platform. The Next.js app can run alone so you can review the product UI. Real jobs need Convex, object storage, the Express API, and the Python worker." },
      { type: "h2", id: "frontend-only", text: "Frontend only" },
      { type: "code", lang: "bash", text: "cd pixel-forge\nnpm install\nnpm run dev" },
      { type: "p", text: "Open http://localhost:3000. Landing comparisons are labeled Sample or Preprocessed. Sign-in stays disabled until NEXT_PUBLIC_CONVEX_URL is set." },
      { type: "h2", id: "full-stack", text: "Full stack" },
      { type: "ol", items: [
        "Start MinIO: docker compose up -d",
        "Copy .env.example into apps/web/.env.local, apps/api/.env, and services/processor/.env",
        "Run npx convex dev from the repo root, then paste JWT keys from node scripts/generate-auth-keys.mjs",
        "Set API_SERVICE_SECRET on Convex to the same value as PROCESSING_WEBHOOK_SECRET",
        "npm run dev:api",
        "Python 3.11 or 3.12: pip install -e services/processor && npm run dev:processor",
      ]},
      { type: "note", title: "First real job", text: "Use Image cleanup or Lanczos upscale before GFPGAN. Those paths do not require model weights." },
      { type: "h2", id: "gpu", text: "Enable GFPGAN / Real-ESRGAN" },
      { type: "code", lang: "bash", text: "pip install -e \"services/processor[gpu,onnx]\"" },
      { type: "p", text: "Weights download on first use when PROCESSOR_ALLOW_MODEL_DOWNLOAD=1. Face jobs without a loaded GFPGAN return MODEL_UNAVAILABLE. Images with no faces return NO_FACES_DETECTED." },
    ],
  },
  {
    slug: "environment",
    title: "Environment variables",
    summary: "Which variables each service needs, and which must never reach the browser.",
    section: "Start here",
    blocks: [
      { type: "p", text: "Copy .env.example. Never commit .env files. Object storage secrets live only on the Node API. The Python worker receives signed URLs and never holds bucket keys." },
      { type: "h2", id: "frontend", text: "Next.js (apps/web/.env.local)" },
      { type: "table", headers: ["Variable", "Required", "Purpose"], rows: [
        ["NEXT_PUBLIC_APP_URL", "Yes in production", "Canonical site URL and metadataBase"],
        ["NEXT_PUBLIC_CONVEX_URL", "For accounts/jobs", "Convex deployment URL (public)"],
        ["NEXT_PUBLIC_API_BASE_URL", "For jobs", "Express API origin, e.g. http://localhost:8080"],
        ["NEXT_PUBLIC_DEMO_MODE", "No", "Hint that labeled demos are allowed when the worker is down"],
      ]},
      { type: "warn", title: "Public prefix", text: "Anything starting with NEXT_PUBLIC_ is bundled into the client. Never put OBJECT_STORAGE_SECRET_KEY, JWT_PRIVATE_KEY, or CONVEX_DEPLOY_KEY here." },
      { type: "h2", id: "convex", text: "Convex dashboard" },
      { type: "table", headers: ["Variable", "Required", "Purpose"], rows: [
        ["SITE_URL", "Recommended", "http://localhost:3000 locally"],
        ["JWT_PRIVATE_KEY", "Yes for auth", "From scripts/generate-auth-keys.mjs"],
        ["JWKS", "Yes for auth", "Public key set matching the private key"],
        ["API_SERVICE_SECRET", "Yes for job updates", "Must match PROCESSING_WEBHOOK_SECRET / API_SERVICE_SECRET on the API"],
      ]},
      { type: "h2", id: "api", text: "Express API (apps/api/.env)" },
      { type: "table", headers: ["Variable", "Required", "Purpose"], rows: [
        ["CONVEX_URL", "Yes", "Same cloud URL the frontend uses"],
        ["API_SERVICE_SECRET", "Yes", "HMAC for Convex HTTP actions. Defaults to PROCESSING_WEBHOOK_SECRET if omitted"],
        ["PROCESSING_WEBHOOK_SECRET", "Yes", "HMAC for worker → API callbacks (min 16 chars)"],
        ["API_PUBLIC_URL", "Yes", "URL the worker uses to POST webhooks, e.g. http://localhost:8080"],
        ["API_CORS_ORIGINS", "Yes", "Comma-separated frontend origins"],
        ["PROCESSING_PROVIDER", "Yes", "local | replicate | gpu-worker | mock"],
        ["PROCESSING_PROVIDER_URL", "If not mock", "Python worker origin, e.g. http://127.0.0.1:8090"],
        ["PROCESSING_PROVIDER_TOKEN", "If not mock", "Bearer token the worker expects"],
        ["OBJECT_STORAGE_ENDPOINT", "Yes for uploads", "S3-compatible endpoint"],
        ["OBJECT_STORAGE_BUCKET", "Yes", "Bucket name"],
        ["OBJECT_STORAGE_ACCESS_KEY", "Yes", "Access key — API only, never Python"],
        ["OBJECT_STORAGE_SECRET_KEY", "Yes", "Secret key — API only, never Python"],
        ["OBJECT_STORAGE_REGION", "No", "Default us-east-1"],
        ["OBJECT_STORAGE_FORCE_PATH_STYLE", "No", "true for MinIO"],
      ]},
      { type: "h2", id: "processor", text: "Python worker (services/processor/.env)" },
      { type: "table", headers: ["Variable", "Required", "Purpose"], rows: [
        ["PROCESSOR_AUTH_TOKEN", "Yes", "Must match PROCESSING_PROVIDER_TOKEN"],
        ["PROCESSING_WEBHOOK_SECRET", "Yes", "Must match the API webhook secret"],
        ["PROCESSOR_DEVICE", "No", "auto | cpu | cuda | mps"],
        ["PROCESSOR_MODEL_DIR", "No", "Weight cache directory"],
        ["PROCESSOR_ALLOW_MODEL_DOWNLOAD", "No", "1 to fetch GFPGAN/Real-ESRGAN on first use"],
      ]},
      { type: "h2", id: "minimum-landing", text: "Minimum to view the landing page" },
      { type: "p", text: "None. npm run dev is enough. Sample PNGs are static files in apps/web/public/samples." },
    ],
  },
  {
    slug: "local-development",
    title: "Local development",
    summary: "Ports, processes, and how the pieces talk to each other on a laptop.",
    section: "Start here",
    blocks: [
      { type: "table", headers: ["Process", "Port", "Command"], rows: [
        ["Next.js", "3000", "npm run dev"],
        ["Express API", "8080", "npm run dev:api"],
        ["Python worker", "8090", "npm run dev:processor"],
        ["MinIO", "9000 / 9001", "docker compose up -d"],
      ]},
      { type: "h2", id: "flow", text: "Request flow" },
      { type: "ol", items: [
        "Browser authenticates with Convex Auth.",
        "Browser asks the API for a signed PUT URL.",
        "Browser uploads bytes straight to object storage.",
        "Browser creates a job. API reserves usage and enqueues the worker.",
        "Worker downloads a signed GET URL, processes, uploads a signed PUT, then HMAC-webhooks the API.",
        "API updates Convex. The dashboard subscribes with useQuery — it does not poll.",
      ]},
      { type: "note", text: "FFmpeg must be on PATH for any video tool. Image cleanup, sharpen, denoise, color, convert, compress, and Lanczos upscale work without GPU models." },
    ],
  },
  {
    slug: "image-enhancement",
    title: "Image enhancement",
    summary: "Upscale, restore, sharpen, denoise, color, convert, and compress.",
    section: "Tools",
    blocks: [
      { type: "h2", id: "upscale", text: "Upscale" },
      { type: "p", text: "Scale 1×, 2×, or 4×. The UI shows estimated output dimensions before you queue. Choose Lanczos for a classical resample. Choose Real-ESRGAN x4plus only when the worker has weights. PixelForge will not silently swap Lanczos in for Real-ESRGAN." },
      { type: "h2", id: "restore", text: "Photo restoration" },
      { type: "p", text: "Presets Light, Balanced, and Strong combine denoise, deblock, contrast, and conservative unsharp. Optional face restoration calls GFPGAN; if that model is missing the classical path still completes unless you required faces." },
      { type: "h2", id: "cleanup", text: "Cleanup, sharpen, denoise, color" },
      { type: "ul", items: [
        "Cleanup: named OpenCV/Pillow operations. Not advertised as generative AI.",
        "Sharpen: unsharp mask with amount, radius, threshold. Subtle / Balanced / Strong avoid halos by default.",
        "Denoise: non-local means at low / medium / high.",
        "Color: exposure, contrast, saturation, highlights, shadows, temperature, tint — restoration, not a Photoshop clone.",
      ]},
      { type: "h2", id: "convert", text: "Convert and compress" },
      { type: "p", text: "JPG, PNG, WebP, AVIF. Transparency is preserved where the format allows. Compress can target quality or a byte budget and still returns a real before/after pair." },
    ],
  },
  {
    slug: "background",
    title: "Background removal",
    summary: "Commercially licensed segmentation, mask preview, and compositing.",
    section: "Tools",
    blocks: [
      { type: "p", text: "Primary model: official BiRefNet weights (MIT). Fallback: rembg + U²-Net (Apache 2.0). BRIA RMBG 1.4 and 2.0 are not shipped." },
      { type: "h2", id: "outputs", text: "Outputs" },
      { type: "ul", items: [
        "Transparent PNG or WebP",
        "Solid background color",
        "Optional edge refinement",
        "Mask stored as a separate file when the worker produces one",
      ]},
      { type: "warn", text: "Do not enable a BRIA checkpoint without a commercial agreement. The worker will refuse unknown non-licensed model ids." },
    ],
  },
  {
    slug: "face",
    title: "Face restoration",
    summary: "GFPGAN v1.4 with honest failure modes.",
    section: "Tools",
    blocks: [
      { type: "p", text: "GFPGAN is Apache 2.0 code from TencentARC. It uses a StyleGAN2 prior whose NVIDIA license can restrict some commercial uses of that component. Read /legal/licenses before selling GFPGAN-backed inference." },
      { type: "h2", id: "behavior", text: "Behavior" },
      { type: "ul", items: [
        "Zero faces → NO_FACES_DETECTED. The landscape is not forced through GFPGAN.",
        "Multiple faces are restored and the count is stored on the job.",
        "Strength and background paste-back are user controls.",
        "Missing weights → MODEL_UNAVAILABLE.",
      ]},
    ],
  },
  {
    slug: "video",
    title: "Video enhancement",
    summary: "FFmpeg pipelines, audio copy, and features that stay unavailable until a real model exists.",
    section: "Tools",
    blocks: [
      { type: "p", text: "Every FFmpeg invocation uses an argument array. There is no shell=True and no string-concatenated filters from unsanitized filenames." },
      { type: "table", headers: ["Tool", "Method", "Notes"], rows: [
        ["Denoise", "hqdn3d", "Temporal-aware, audio copied"],
        ["Sharpen", "unsharp", "Conservative amounts"],
        ["Stabilize", "vidstab", "Analyze then transform"],
        ["Convert / compress", "libx264 / vp9", "MP4 or WebM"],
        ["Thumbnails", "FFmpeg stills", "Single, contact sheet, timestamp"],
        ["AI upscale", "Real-ESRGAN frames", "Requires GPU worker; otherwise choose FFmpeg scale explicitly"],
        ["Interpolate", "Not enabled", "Coming soon — never frame duplication"],
      ]},
    ],
  },
  {
    slug: "tools-index",
    title: "Tool reference",
    summary: "Every workspace tool, whether it needs a model, and where it lives in the UI.",
    section: "Tools",
    blocks: [
      { type: "p", text: "Tools share one job system. Classical OpenCV/Pillow/FFmpeg paths run without GPU weights. Model-backed tools fail closed with MODEL_UNAVAILABLE instead of silently switching algorithms." },
      { type: "table", headers: ["Tool", "Route", "Needs model", "Notes"], rows: [
        ["Image upscaler", "/tools/upscale", "Optional", "Lanczos always; Real-ESRGAN when weights exist"],
        ["Photo restoration", "/tools/restore", "Optional GFPGAN", "Light / Balanced / Strong classical presets"],
        ["Face restoration", "/tools/face", "Yes GFPGAN", "Zero faces → NO_FACES_DETECTED"],
        ["Background removal", "/tools/background", "Yes", "BiRefNet MIT, U²-Net fallback. No BRIA"],
        ["Cleanup", "/tools/cleanup", "No", "Named OpenCV/Pillow ops"],
        ["Sharpen / denoise / color", "/tools/*", "No", "Restoration controls, not a general editor"],
        ["Convert / compress", "/tools/convert", "No", "JPG PNG WebP AVIF"],
        ["Video denoise/sharpen/stabilize", "/tools/video", "No", "FFmpeg; audio copied"],
        ["Video AI upscale", "/tools/video", "Yes", "Real-ESRGAN frames on GPU worker"],
        ["Frame interpolation", "/tools/video", "Unavailable", "Coming soon — never frame duplication"],
      ]},
    ],
  },
  {
    slug: "architecture",
    title: "Architecture",
    summary: "Why processing is not on Vercel, and how providers swap.",
    section: "Platform",
    blocks: [
      { type: "code", lang: "text", text: "Vercel (Next.js)\n  → Express API\n    → ProcessingProvider (local | replicate | gpu-worker | mock)\n      → Python FastAPI worker\n        → Object storage (signed URLs)\n    → Convex HTTP action (job status)\n  → Convex (auth, metadata, usage)" },
      { type: "p", text: "PyTorch, GFPGAN, Real-ESRGAN, and long FFmpeg jobs never run inside Vercel request handlers. The UI does not know which provider executed a job." },
      { type: "h2", id: "rules", text: "Hard rules" },
      { type: "ul", items: [
        "Convex stores metadata only. Binaries stay in object storage.",
        "Python never talks to Convex and never holds storage keys.",
        "Routes must not call Python directly; they go through ProcessingProvider.",
        "Every Convex query filters by the authenticated userId.",
      ]},
    ],
  },
  {
    slug: "api",
    title: "HTTP API",
    summary: "Gateway endpoints, auth, and webhooks.",
    section: "Platform",
    blocks: [
      { type: "table", headers: ["Method", "Path", "Auth"], rows: [
        ["GET", "/api/health", "Public"],
        ["GET", "/api/provider", "Public"],
        ["POST", "/api/uploads/presign", "Bearer Convex token"],
        ["POST", "/api/jobs", "Bearer"],
        ["GET", "/api/jobs", "Bearer"],
        ["GET", "/api/jobs/:id", "Bearer"],
        ["POST", "/api/jobs/:id/cancel", "Bearer"],
        ["DELETE", "/api/jobs/:id", "Bearer"],
        ["GET", "/api/files/:id/download", "Bearer — JSON downloadUrl, or streamed private blob"],
        ["POST", "/api/webhooks/provider", "HMAC or processor token"],
      ]},
      { type: "h2", id: "job-body", text: "Create job" },
      { type: "code", lang: "json", text: "{\n  \"tool\": \"image.upscale\",\n  \"inputFileId\": \"k17...\",\n  \"parameters\": {\n    \"scale\": 2,\n    \"model\": \"lanczos\",\n    \"outputFormat\": \"png\",\n    \"quality\": 92\n  }\n}" },
      { type: "p", text: "Job creation returns 202 with jobId immediately. Processing is asynchronous." },
    ],
  },
  {
    slug: "error-codes",
    title: "Error codes",
    summary: "Stable codes returned to the dashboard. PixelForge never hides these behind a generic something-went-wrong string.",
    section: "Platform",
    blocks: [
      { type: "p", text: "Every failed job stores errorCode on the Convex row. The UI maps that code through describeError() to a user message plus a next action." },
      { type: "table", headers: ["Code", "Meaning", "What to do"], rows: [
        ["UNSUPPORTED_FORMAT", "MIME/magic not allowed", "Use JPG, PNG, WebP, AVIF, MP4, MOV, WebM, MKV"],
        ["FILE_TOO_LARGE", "Over plan/file limit", "50 MB images, 500 MB video"],
        ["DIMENSIONS_TOO_LARGE", "Longest edge or megapixels", "Stay under 8192 px / 40 MP"],
        ["INVALID_FILE", "Not a real image/video", "Re-export from a trusted editor"],
        ["DECOMPRESSION_BOMB", "Declared size unsafe", "Use a smaller source"],
        ["MODEL_UNAVAILABLE", "Weights not loaded", "Install gpu extras or pick Lanczos/cleanup"],
        ["NO_FACES_DETECTED", "GFPGAN found zero faces", "Use restore or upscale instead"],
        ["PROVIDER_UNAVAILABLE", "Worker unreachable", "Start the Python worker"],
        ["INTERPOLATION_UNAVAILABLE", "No interpolator configured", "Expected — frames are never duplicated"],
        ["INSUFFICIENT_USAGE", "Monthly quota", "Wait or change plan when billing exists"],
        ["STORAGE_ERROR", "S3/MinIO rejected I/O", "Check API-only storage credentials"],
        ["UNAUTHORIZED", "Missing session", "Sign in"],
        ["WEBHOOK_INVALID", "HMAC mismatch", "Align PROCESSING_WEBHOOK_SECRET"],
      ]},
    ],
  },
  {
    slug: "authentication",
    title: "Authentication",
    summary: "Convex Auth password provider, sessions, and API bearer tokens.",
    section: "Platform",
    blocks: [
      { type: "p", text: "Accounts use Convex Auth with the Password provider (Scrypt). Sign up, sign in, and logout are implemented. Email verification and reset require an email provider in convex/auth.ts — until then the reset page explains that honestly." },
      { type: "p", text: "The dashboard sends Authorization: Bearer <convex-token> to the Express API. The API constructs a ConvexHttpClient with that token so every mutation still runs as the user." },
    ],
  },
  {
    slug: "storage",
    title: "Upload and storage",
    summary: "Untrusted uploads, signed URLs, retention, and deletion.",
    section: "Platform",
    blocks: [
      { type: "ul", items: [
        "MIME allowlists plus magic-byte checks on the worker",
        "Randomized object keys — client filenames are never used as paths",
        "Signed PUT for upload, signed GET for download, both short-lived",
        "Retention 24h / 7d / 30d, plus immediate delete from history",
        "Decompression-bomb guard before decode",
      ]},
    ],
  },
  {
    slug: "limits",
    title: "Limits and usage",
    summary: "Plan ceilings, reservations, and refunds on failure.",
    section: "Operate",
    blocks: [
      { type: "table", headers: ["Plan", "Image jobs", "Video jobs", "Inbound bytes"], rows: [
        ["free", "30 / month", "3 / month", "1 GB"],
        ["pro", "500", "40", "20 GB"],
        ["team", "2000", "200", "100 GB"],
      ]},
      { type: "p", text: "usageService.reserve → process → commit. Failed jobs refund reserved quota. Billing is not wired; the counters still enforce limits." },
      { type: "p", text: "Hard file limits: 50 MB images, 500 MB video, 8192 px longest edge, 40 megapixels." },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy",
    summary: "What is stored, for how long, and what we do not claim.",
    section: "Operate",
    blocks: [
      { type: "p", text: "Convex holds email, job parameters, dimensions, and error codes. Object storage holds the bytes. The worker keeps pixels in RAM during a job. PixelForge does not claim “100% private.”" },
      { type: "p", text: "Default retention is 7 days. You can set 24 hours or 30 days, or delete a job immediately, which removes input, output, and mask objects." },
    ],
  },
  {
    slug: "licenses",
    title: "Model licenses",
    summary: "What may be used commercially, and what was excluded on purpose.",
    section: "Operate",
    blocks: [
      { type: "table", headers: ["Component", "License", "Ship?"], rows: [
        ["GFPGAN code", "Apache 2.0 + NVIDIA StyleGAN2 caveat", "Yes, documented"],
        ["Real-ESRGAN", "BSD-3-Clause", "Yes"],
        ["BiRefNet official", "MIT", "Yes"],
        ["U²-Net / rembg", "Apache 2.0 / MIT", "Yes"],
        ["BRIA RMBG 1.4/2.0", "Non-commercial without a deal", "No"],
      ]},
    ],
  },
  {
    slug: "deployment",
    title: "Deployment",
    summary: "Vercel for the web app, containers for API and worker.",
    section: "Operate",
    blocks: [
      { type: "p", text: "Point a Vercel project at apps/web (or the monorepo with the web workspace). Set NEXT_PUBLIC_CONVEX_URL and NEXT_PUBLIC_API_BASE_URL. Do not set storage secrets on Vercel unless you also run the API there — the API should be a separate container." },
      { type: "ul", items: [
        "API image: apps/api/Dockerfile",
        "Worker image: services/processor/Dockerfile on a GPU host for GFPGAN",
        "PROCESSING_PROVIDER=gpu-worker and PROCESSING_PROVIDER_URL on the API",
      ]},
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    summary: "Honest errors and the checks that usually fix them.",
    section: "Operate",
    blocks: [
      { type: "table", headers: ["Symptom", "Check"], rows: [
        ["Landing samples blank", "Confirm /samples/*.jpg exist; run npm run fetch:samples"],
        ["Output image 400 or 403", "Private Blob URLs are not public. The download route streams the file; the dashboard must not use *.private.blob.vercel-storage.com as an image source."],
        ["Sign up disabled", "NEXT_PUBLIC_CONVEX_URL plus JWT_PRIVATE_KEY / JWKS"],
        ["PROVIDER_UNAVAILABLE", "API + worker running; PROCESSING_PROVIDER_URL"],
        ["MODEL_UNAVAILABLE", "pip install gpu extra; allow model download"],
        ["NO_FACES_DETECTED", "Use restore/upscale instead of face restoration"],
        ["INTERPOLATION_UNAVAILABLE", "Expected until a licensed interpolator is configured"],
        ["STORAGE_ERROR", "MinIO/S3 credentials on the API only"],
      ]},
    ],
  },
];

export function docBySlug(slug: string): DocPage | undefined {
  return DOC_PAGES.find((page) => page.slug === slug);
}

export function docsNav() {
  return DOC_SECTIONS.map((section) => ({
    section,
    pages: DOC_PAGES.filter((page) => page.section === section),
  }));
}

export function adjacent(slug: string): { prev?: DocPage; next?: DocPage } {
  const index = DOC_PAGES.findIndex((page) => page.slug === slug);
  return {
    prev: index > 0 ? DOC_PAGES[index - 1] : undefined,
    next: index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : undefined,
  };
}

export function headings(page: DocPage): { id: string; text: string }[] {
  return page.blocks.flatMap((block) =>
    block.type === "h2" || block.type === "h3" ? [{ id: block.id, text: block.text }] : [],
  );
}

export function searchDocs(query: string): DocPage[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return DOC_PAGES.filter((page) => pageMatches(page, q));
}

function pageMatches(page: DocPage, q: string): boolean {
  if (
    page.title.toLowerCase().includes(q) ||
    page.summary.toLowerCase().includes(q) ||
    page.section.toLowerCase().includes(q) ||
    page.slug.toLowerCase().includes(q)
  ) {
    return true;
  }
  return page.blocks.some((block) => {
    if ("text" in block && String(block.text).toLowerCase().includes(q)) return true;
    if ("items" in block && block.items.some((item) => item.toLowerCase().includes(q))) return true;
    if (
      "headers" in block &&
      [...block.headers, ...block.rows.flat()].some((cell) => cell.toLowerCase().includes(q))
    ) {
      return true;
    }
    return false;
  });
}
