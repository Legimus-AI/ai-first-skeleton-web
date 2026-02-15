# AI-First Skeleton — Web Frontend

React 19 + TanStack Router + TanStack Query + Tailwind v4 frontend.

## This is a component repo

This frontend is designed to be placed inside an AI-First Skeleton backend repo as `apps/web/`.
It cannot run standalone — it depends on `@repo/shared` from the backend workspace.

## Compatible backends

- [ai-first-skeleton](https://github.com/Legimus-AI/ai-first-skeleton) (TypeScript — PostgreSQL/Drizzle or MongoDB/Mongoose)
- [ai-first-skeleton-fastapi](https://github.com/Legimus-AI/ai-first-skeleton-fastapi) (Python — FastAPI/SQLAlchemy)

## Setup (inside a backend repo)

```bash
git clone https://github.com/Legimus-AI/ai-first-skeleton-web.git apps/web
rm -rf apps/web/.git
pnpm install
```

Or use the backend's setup script: `./scripts/setup.sh`

## After setup

From the backend repo root:

| Task | Command |
|------|---------|
| Dev (all) | `pnpm dev` |
| Dev Web only | `pnpm dev:web` |
| Lint | `pnpm lint` |
| Type check | `pnpm typecheck` |
| Test | `pnpm test` |

## API client

Uses a backend-agnostic fetch wrapper (`src/lib/api-client.ts`). Response types come from `@repo/shared` (Zod schemas) — validated at runtime. No dependency on any specific backend framework.

## Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query |
| API Client | Fetch wrapper + Zod validation |
| Styles | Tailwind CSS v4 + CVA |
| Forms | React Hook Form + Zod |
| UI Components | shadcn/ui (copy-paste owned) |
| Lint/Format | Biome |
