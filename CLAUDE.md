@AGENTS.md

# Frontend Component Repo

This repo is meant to be cloned into a backend skeleton's `apps/web/` directory.
It depends on `@repo/shared` (Zod schemas) and `@repo/api` (AppType for Hono RPC).

## How it works

When placed inside a backend repo at `apps/web/`, pnpm workspaces resolves:
- `@repo/shared` → `packages/shared/` (Zod schemas, shared types)
- `@repo/api` → `apps/api/` (AppType for Hono RPC type inference)

No code changes needed — the workspace resolution handles everything.

## After placing in a backend repo

- `pnpm dev` — starts frontend + backend
- `pnpm test` — runs all tests
- `pnpm lint` — checks all code
- `pnpm verify` — full validation
