# Architecture — PixelForge

## Intent

PixelForge is a multi-service restoration workspace: Next.js on Vercel, Express API gateway, Convex metadata/auth, private object storage, and a Python FastAPI worker running OpenCV, Pillow, FFmpeg, Real-ESRGAN, and GFPGAN.

## System shape

```text
Browser → Next.js → Convex (meta/auth)
                 → Express API → S3 + ProcessingProvider → Python worker
Worker → HMAC webhook → API → Convex service action
```

## Stack decisions

- Next.js
- Express
- Convex Auth
- S3-compatible storage
- Python FastAPI worker
- OpenCV / FFmpeg / Real-ESRGAN / GFPGAN

## Boundaries

- Secrets stay in environment variables / secret managers — never in git.
- Client bundles only receive public configuration (`NEXT_PUBLIC_*` / `VITE_*`).
- Tenant or role checks belong in middleware / server layers, not UI-only gates.
- Heavy or long-running work should not run inside short-lived serverless handlers unless designed for it.

## Quality bar

- Prefer typed contracts at API and domain boundaries.
- Ship a vertical slice (auth → persisted outcome) before a broad feature surface.
- Document trade-offs in PRs when changing data models or auth.

