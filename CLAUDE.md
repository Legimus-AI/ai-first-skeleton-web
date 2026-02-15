@AGENTS.md

# Frontend Component Repo

This repo is meant to be cloned into a backend skeleton's `apps/web/` directory.
It depends on `@repo/shared` (Zod schemas) for response validation.

## API client architecture

Uses a simple fetch wrapper (`src/lib/api-client.ts`) — no Hono RPC, no openapi-fetch.
This makes the frontend compatible with ANY backend that follows the AI-First API contract:
- Same endpoint paths (`/api/<slice>`, `/api/<slice>/:id`)
- Same response shapes (`{ data, meta }` for lists, `{ data }` for single)
- Same error shapes (`{ error: { code, message, requestId } }`)

Types come from `@repo/shared` (Zod schemas), resolved via pnpm workspaces.

## After placing in a backend repo

- `pnpm dev` — starts frontend + backend
- `pnpm test` — runs all tests
- `pnpm lint` — checks all code
- `pnpm verify` — full validation
