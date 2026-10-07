# Frontend Design Guard

## When to use
Any task involving UI components, page layout, or style changes.

## Core constraints
- Spacing must land on the 8px / 4px grid. Reject 13px padding outright
- Colors only from `--color-*` design tokens. No hex in components
- Every interactive component implements 8 states: default / hover / focus / pressed / disabled / loading / error / active
- Body text no smaller than 16px. 12px only for auxiliary labels
- Touch targets minimum 44x44px
- Animations use `cubic-bezier(0.16, 1, 0.3, 1)`. No linear transitions, no excessive bounce

## Design language (PixelForge-specific)
- Dark theme base: `--color-bg: #0a0a0b`, `--color-surface: #141416`
- Accent: restrained amber or cool blue. No purple/indigo gradients
- No glow, blob, or glass morphism clichés
- Before/After comparison areas keep a neutral background so image quality is judged fairly








# Add a New Image Processing Tool

## When to use
When adding a new image processing capability to PixelForge.

## Prerequisites
- Tool category is clear (enhancement / restoration / conversion / cleanup)
- Required model or OpenCV pipeline availability is confirmed
- Required models are registered in ModelRegistry

## Steps
1. Create `services/processor/app/pipelines/{tool_name}_pipeline.py`
2. Pipeline class implements three phases: validate() → process() → encode()
3. Add Pydantic v2 input/output models in `services/processor/app/schemas/`
4. Register the FastAPI endpoint in `services/processor/app/routers/`
5. Add the tool definition in Node API `apps/api/src/routes/tools.ts`
6. Add tool config in frontend `apps/web/src/lib/tools.ts` (icon, label, options schema)
7. Create the tool page at `apps/web/src/app/(dashboard)/tools/{tool_name}/page.tsx`
8. Add unit tests: `services/processor/tests/pipelines/test_{tool_name}.py`
9. Verify with a real image: output dimensions, format, and quality are correct

## Verification
- `pytest services/processor/tests/ -k {tool_name}` passes
- Full flow works in the frontend: upload → process → download
- Failures return meaningful user errors (no Python stack traces)










# Convex Schema Changes

## When to use
When adding tables, modifying fields, or changing indexes.

## Steps
1. Modify the definition in `convex/schema.ts`
2. If adding a required field, first add it as optional, write a migration to backfill, then mark it required
3. Run `npx convex dev` to verify the schema compiles
4. Update all affected queries/mutations and confirm userId filtering is still correct
5. Verify with test users: user A cannot access user B's data through any query
6. Update `convex/_generated/` types (automatic)

## Forbidden
- Deleting a field without first marking it deprecated
- Changing a field type without a conversion path
- Introducing a new cross-user leakage path in a schema change












# PixelForge — Agent Collaboration Contract

## Project nature
PixelForge is a professional media restoration platform. Not a demo, not an AI toy.
Every PR must be deployable, testable, and usable by real users.

## Architecture iron rules
1. Heavy processing never runs inside Vercel functions. Processing goes through a queue + dedicated workers
2. ProcessingProvider is the only processing entry point. Local / Replicate / GPU are swappable
3. Convex stores state. Object storage stores files. No binaries in Convex
4. The Python service reads/writes storage via signed URLs. It never holds storage keys

## User safety
- Uploaded files are untrusted. Validate MIME + magic bytes. Do not trust extensions
- Every query filters by userId. Cross-user access is a security defect
- Download URLs must be signed with an expiry

## Forbidden
- No fake progress. If only job state is available, show state
- No "Something went wrong." Every error has an errorCode + userMessage
- No hardcoded secrets in frontend
- No shell injection (FFmpeg uses argument arrays)

## Definition of done
- Build passes, type check passes, lint passes
- At least one end-to-end test flows: upload → process → download
- Error paths are tested: invalid file, timeout, no GPU fallback