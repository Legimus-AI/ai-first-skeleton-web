# AI-First Skeleton — Web Frontend

React 19 + TanStack Router + TanStack Query + Tailwind v4 frontend.

## This is a component repo

This frontend is designed to be placed inside an AI-First Skeleton backend repo as `apps/web/`.
It cannot run standalone — it depends on `@repo/shared` and `@repo/api` from the backend workspace.

## Compatible backends

- [ai-first-skeleton](https://github.com/Legimus-AI/ai-first-skeleton) (PostgreSQL + Drizzle)
- [ai-first-skeleton-mongo](https://github.com/Legimus-AI/ai-first-skeleton-mongo) (MongoDB + Mongoose)

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

## Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query + Hono RPC |
| Styles | Tailwind CSS v4 + CVA |
| Forms | React Hook Form + Zod |
| UI Components | shadcn/ui (copy-paste owned) |
| Lint/Format | Biome |
