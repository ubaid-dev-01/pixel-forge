# Vercel deploy (PixelForge)

## Current working setup (live)

Project: **pixelforge**  
Root Directory: `apps/web`  
Framework: Next.js  

This deploys the **web UI + Convex auth**. Preview already succeeds via CLI.

### Why not full Services (API + Python) in one shot?

Vercel **Services** currently rejects **Edge middleware**. Convex Auth uses Edge middleware → Services build fails.  
So for now: **web on Vercel**, API/Python either local or separate later (or wait for Services+Edge).

## Deploy from this machine

```bash
cd d:\Projectes\pixel-forge
npx vercel link --yes --project pixelforge
npx vercel --yes          # preview
npx vercel --prod --yes   # production (needs approval in Cursor)
```

## Env vars (already set on project)

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEMO_MODE=true`
- `NEXT_PUBLIC_API_BASE_URL` (empty = no remote API yet)

## After production URL is live

```bash
npx convex env set SITE_URL https://pixelforge.vercel.app
npx convex deploy
```

## Optional: Git auto-deploy

```bash
# push repo to GitHub first, then:
npx vercel git connect
```

## Next (uploads working on cloud)

1. Cloudflare R2 bucket + CORS  
2. Separate Vercel projects for Express API + Python **or** Node `sharp` processor inside Next.js routes  
3. Set `NEXT_PUBLIC_DEMO_MODE=false` and real storage keys  
