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
1. Native Git: `vercel git connect https://github.com/ubaid-dev-01/pixel-forge.git`
2. GitHub Actions: set secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

