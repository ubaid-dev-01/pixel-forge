# Vercel — full stack (web + API + Python)

Laptop / alag server ki zaroorat nahi. **Ek hi Vercel project** pe teen services deploy hoti hain:

| Service | Path | Role |
| --- | --- | --- |
| `web` | `apps/web` | Next.js UI + auth |
| `api` | `apps/api` | Express gateway (public `/api/*`) |
| `processor` | `services/processor` | FastAPI Python worker (**private**, binding se) |

Ye **Vercel Services (Beta)** use karta hai — root `vercel.json` me configured.

## Limits (seedha)

- Classical image tools (Lanczos upscale, sharpen, denoise, convert, compress, color, restore presets) → Vercel pe chalenge.
- Heavy AI weights (GFPGAN / Real-ESRGAN / video FFmpeg) → bundle/timeout limit; pehle classical pe live raho.
- Local MinIO laptop pe nahi chalega → cloud object storage chahiye (**Cloudflare R2** recommended, free tier).

## 1. Git → Vercel

1. Poora **pixel-forge** repo import karo (Root Directory = repo root, **blank / `.`** — `apps/web` mat set karo).
2. Framework preset: **Other** / Services (dashboard me Services enable agar option ho).
3. Root `vercel.json` khud services + rewrites set karega.
4. Node **22.x**.

## 2. Environment variables (Project → Settings → Env)

Sab environments (Production + Preview) pe:

### Web / shared
| Name | Example |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (deploy ke baad update) |
| `NEXT_PUBLIC_CONVEX_URL` | `https://necessary-spoonbill-846.convex.cloud` |
| `NEXT_PUBLIC_API_BASE_URL` | *(empty)* — same-origin `/api` use hoga |
| `NEXT_PUBLIC_DEMO_MODE` | `false` |

### API + processor
| Name | Example |
| --- | --- |
| `CONVEX_URL` | same as `NEXT_PUBLIC_CONVEX_URL` |
| `CONVEX_SITE_URL` | `https://….convex.site` |
| `API_SERVICE_SECRET` | long random (≥16 chars) |
| `PROCESSING_WEBHOOK_SECRET` | same as above (or another long secret) |
| `PROCESSING_PROVIDER` | `local` |
| `PROCESSING_PROVIDER_TOKEN` | long random (API ↔ Python) |
| `PROCESSOR_AUTH_TOKEN` | **same** as `PROCESSING_PROVIDER_TOKEN` |
| `API_CORS_ORIGINS` | `https://your-app.vercel.app` |
| `API_PUBLIC_URL` | `https://your-app.vercel.app` |

`PROCESSING_PROVIDER_URL` **mat set karo** — Services binding inject karti hai.

### Object storage (Cloudflare R2 — free)

1. Cloudflare → R2 → create bucket `pixelforge-media`
2. Create API token (read/write)
3. Bucket Settings → CORS:

```json
[
  {
    "AllowedOrigins": ["https://your-app.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Vercel env:

| Name | Value |
| --- | --- |
| `OBJECT_STORAGE_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `OBJECT_STORAGE_REGION` | `auto` |
| `OBJECT_STORAGE_BUCKET` | `pixelforge-media` |
| `OBJECT_STORAGE_ACCESS_KEY` | R2 access key |
| `OBJECT_STORAGE_SECRET_KEY` | R2 secret |
| `OBJECT_STORAGE_FORCE_PATH_STYLE` | `true` |

## 3. Convex

```bash
npx convex env set SITE_URL https://your-app.vercel.app
npx convex env set API_SERVICE_SECRET <same-as-vercel-API_SERVICE_SECRET>
npx convex deploy
```

JWT keys pehle se set hon (`scripts/generate-auth-keys.mjs`).

## 4. Deploy

```bash
# pehli dafa
npx vercel link
npx vercel --prod
```

Ya Git push → automatic deploy.

## 5. Smoke

```bash
curl https://your-app.vercel.app/api/health
curl -I https://your-app.vercel.app/
```

Sign up → `/tools/upscale` → image upload.

## Local (optional)

Laptop pe ab bhi:

```bash
npm run dev:web
npm run dev:api
npm run dev:processor
npm run dev:s3
```

Ya ek saath: `npx vercel dev` (Services + bindings locally).
