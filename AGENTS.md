# PixelForge agent notes

Read and follow `.cursor/rules/` before changing product code:

| Rule | Purpose |
| --- | --- |
| `master.mdc` | Always-on product + architecture bar |
| `global.mdc` | Security red lines |
| `frontend-design.mdc` | Light theme, spacing, anti-AI-cliché |
| `typography.mdc` | Instrument Serif + Geist + scale |
| `seo.mdc` | Metadata, JSON-LD, sitemap/robots |
| `frontend-nextjs.mdc` | App Router patterns |
| `node-api.mdc` | Express validation and logging |

Light theme is the default. Do not reintroduce purple gradients, dark-as-default marketing pages, or fake processing states.

Testing:

- Unit/integration: `npm run test:all`
- E2E: `npm run test:e2e`
