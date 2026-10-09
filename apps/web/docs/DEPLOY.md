# Deploy — pixelforge

## Vercel project
- Name: `pixelforge`
- GitHub: https://github.com/ubaid-dev-01/pixel-forge
- Root Directory: `apps/web`

## CLI
```bash
cd pixel-forge/apps/web
vercel --prod --yes
```

## Pipeline
GitHub is connected to the Vercel project. A push to `main` deploys production. Do not add a second GitHub Actions deploy; it needs `VERCEL_TOKEN` and would deploy twice.

