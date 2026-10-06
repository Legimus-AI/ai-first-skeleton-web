# AI-First Skeleton — Web Frontend

React 19 + TanStack Router + TanStack Query + Tailwind v4 frontend for the [AI-First Architecture](https://github.com/Legimus-AI/ai-first-architecture) v2.9.0 skeletons.
It is a component repo: a backend skeleton's `scripts/setup.sh` clones it into `apps/web/`, where it takes its types from `@repo/shared` and talks to the API through a plain fetch wrapper.

## 🚀 Quick start

This frontend cannot run standalone: it depends on `@repo/shared` from the backend workspace. Start from a backend skeleton and let its setup install this repo:

```bash
git clone https://github.com/Legimus-AI/ai-first-skeleton-typescript.git my-app
cd my-app
./scripts/setup.sh --db postgres   # clones this repo into apps/web/ and stamps .skeleton-version
```

Then follow the backend's quick start to run the API, and start this app with `pnpm dev:web` (TypeScript backend) or `make dev` (FastAPI backend, API + web together). The app runs on http://localhost:5173 and Vite proxies `/api/` to the backend (`VITE_API_URL`, default `http://localhost:3000`).

Cloning by hand works too, but then no stamp records which commit of this repo the project started from:

```bash
git clone https://github.com/Legimus-AI/ai-first-skeleton-web.git apps/web
rm -rf apps/web/.git
pnpm install
```

## 🔌 Compatible backends

- [ai-first-skeleton-typescript](https://github.com/Legimus-AI/ai-first-skeleton-typescript) (TypeScript — PostgreSQL/Drizzle or MongoDB/Mongoose), the reference implementation
- [ai-first-skeleton-fastapi](https://github.com/Legimus-AI/ai-first-skeleton-fastapi) (Python — FastAPI/SQLAlchemy or Beanie)

Any backend that follows the AI-First API contract works: `/api/v1/<slice>` paths, `{ data, meta }` for lists, `{ data }` for one record, `{ error: { code, message, requestId } }` for errors.

## 🧰 What you get

| | Capability | What you get | Guide |
|---|---|---|---|
| 🔐 | Auth flows | Login, register, optional Google button, an `_authed` route guard with a pending skeleton, profile and settings pages | [Auth and API keys](docs/auth-and-api-keys.md) |
| 🔑 | API key page | Create (token shown once, with copy) and revoke keys at `/settings/api-keys`, with scope presets (read only, read and write, full access for owner/admin) shown in the table, and how to connect an agent (MCP URL and CLI variables) | [Auth and API keys](docs/auth-and-api-keys.md#what-a-key-created-here-can-do) |
| 🪝 | Webhooks page | Destinations (signing secret shown once), sent events with delivery state, attempts and resend at `/settings/webhooks`, for owner and admin | [Auth and API keys](docs/auth-and-api-keys.md#webhooks) |
| 🧭 | Layout archetypes | Four shell presets (sidebar, navbar, focused, split) picked by the product archetype in `DESIGN_BRIEF.md`, plus a governed `custom` escape hatch | [Layouts](docs/layouts.md) |
| 🗂️ | Reference slices | `todos` (admin CRUD), `chat` (conversational), `editor` (focused tool), `board` (custom, full-bleed kanban), `team` | [AGENTS.md](AGENTS.md) |
| 📋 | CRUD view contract | DataTable with server pagination, search, sort, bulk delete, `FormDialog` create/edit, `ConfirmDelete`, skeleton and empty states | [INVARIANTS.md](INVARIANTS.md) |
| 🔌 | API client | Backend-agnostic fetch wrapper with timeout, typed errors, Zod response validation, one session policy (401 → login and back) and Spanish user messages | [API client](docs/api-client.md) |
| ⚡ | Optimistic mutations | `useOptimisticMutation` for toggles and inline edits | [Optimistic mutations](docs/optimistic-mutations.md) |
| 📄 | URL-driven lists | `page`, `search`, `sort`, `order` live in the URL; route loaders prefetch with `queryOptions` | [Pagination](docs/pagination.md) |
| 🎨 | Design system | Suave identity in one swappable token block (OKLCH colors, Onest, radii, elevation, density, motion), Phosphor icons behind `@/ui/icons`, owned shadcn/ui-style primitives | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| ✨ | Motion | CSS-only fade, page and list primitives that respect reduced motion | [Motion](docs/motion.md) |
| 🌍 | Locale formatting | `Intl` formatting from `VITE_LOCALE` | [i18n](docs/i18n.md) |
| 📈 | Integration recipes | Sentry, Microsoft Clarity and OpenTelemetry for observability; browser push notifications (`use-push-notifications`) | [Recipes](docs/recipes/) |
| 🧪 | Architecture test | `INVARIANTS.md` as code: CORE vs PATTERN: CRUD layers, archetype-to-shell gate, folder contracts | [INVARIANTS.md](INVARIANTS.md) |
| 🛡️ | Guardrails for coding agents | `AGENTS.md` for every agent; a Claude Code stop hook, path-scoped rules and a `.env` read deny | [Agent guardrails](docs/agent-guardrails.md) |
| 🏷️ | Skeleton stamp | The backend's `setup.sh` records this repo's commit as `web=` in `.skeleton-version`, so `/sync-skeleton` can bring later fixes into `apps/web/` | [Skeleton stamp](docs/agent-guardrails.md#skeleton-stamp-and-sync-skeleton) |

## 🤖 AI agents

**Coding agents** read [`AGENTS.md`](AGENTS.md); `CLAUDE.md` is an adapter that only imports `AGENTS.md`, `INVARIANTS.md` and `DESIGN_SYSTEM.md`. Claude Code also gets a stop hook (architecture test before it finishes), path-scoped rules and a deny rule for `.env`; they load only when the session starts inside the repo. Details: [docs/agent-guardrails.md](docs/agent-guardrails.md).

**Agents that use the product** do not go through this UI: they call the backend with an API key, through its CLI or its MCP endpoint (TypeScript backend: [agent surface guide](https://github.com/Legimus-AI/ai-first-skeleton-typescript/blob/main/docs/agent-surface.md)). The API key page offers read-only, read-and-write and (for owner/admin) full-access keys; for other scopes, use the backend's `pnpm agent login --scopes ...` or the API.

## ⌨️ Commands

From the backend repo root, once this repo sits in `apps/web/`:

| Task | TypeScript backend | FastAPI backend |
|------|--------------------|-----------------|
| Dev web app | `pnpm dev:web` | `make dev-web` (`make dev` runs API + web) |
| Build | `pnpm build` | `pnpm build:web` |
| Lint | `pnpm lint` | `make lint` |
| Type check | `pnpm --filter @repo/web typecheck` | `make typecheck` |
| Tests | `pnpm test` | `pnpm --filter @repo/web test` |
| Architecture test | `pnpm test:arch` | `pnpm --filter @repo/web test:arch` |
| E2E tests | `pnpm test:e2e` | `pnpm test:e2e` |

Inside `apps/web/` itself: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:arch`, `pnpm verify` and `pnpm route:generate`. This repo's own CI runs Biome and the architecture test without a full install.

## 🧭 Layout archetypes

The skeleton does not assume every product is an admin dashboard. Before building views,
declare a **product archetype** in `DESIGN_BRIEF.md` Layer 0; it selects the layout shell
(one import in `src/routes/_authed.tsx`) and which invariants apply.

| Archetype | Shell | Reference slice |
|-----------|-------|-----------------|
| `admin-crud` | `authed-layout` (sidebar) / `navbar-layout` | `src/slices/todos/` |
| `conversational` / `split-view` | `split-layout` | `src/slices/chat/` |
| `focused-tool` | `focused-layout` | `src/slices/editor/` |
| `custom` | design from scratch (governed) | `src/slices/board/` (full-bleed kanban) |

`architecture.test.ts` enforces this: a filled brief must declare an archetype and the wired
shell must match it; the `custom` escape hatch requires a logged decision in
`docs/DECISIONS.ndjson`. Only `*-list.tsx` slices opt into the CRUD contract, so non-CRUD
products are never forced into a DataTable. See AGENTS.md "Layout Reasoning" and [docs/layouts.md](docs/layouts.md).

## 🧩 API client and UI primitives

The API client is a backend-agnostic fetch wrapper (`src/services/api-client.ts`). Response types come from `@repo/shared` (Zod schemas) and are validated at runtime, so there is no dependency on any backend framework. Examples: [docs/api-client.md](docs/api-client.md).

UI primitives live in `src/ui/` (shadcn/ui pattern: the repo owns them); `Segmented` picks one of a few options and `ThemeSegmented` is built on it. Body-portaled comboboxes should use `src/ui/floating-listbox.ts` together with
`src/ui/floating-listbox-panel.tsx`. They keep dropdown geometry in viewport coordinates,
protect dialog outside-interaction handling, and compose a nested scroll lock so native
wheel/touch input works inside Radix dialogs.

## 🧱 Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query 5 |
| API Client | Fetch wrapper + Zod validation |
| Styles | Tailwind CSS v4 + CVA |
| Forms | React Hook Form + Zod |
| UI Components | shadcn/ui pattern (copy-paste owned) on Radix primitives |
| Icons and font | Phosphor (through `@/ui/icons`), Onest Variable self-hosted |
| Lint/Format | Biome |

## 📚 Documentation

Start at [docs/README.md](docs/README.md): it lists every guide, grouped by task. At the root: [AGENTS.md](AGENTS.md) (agent instructions), [INVARIANTS.md](INVARIANTS.md) (rules the architecture test enforces), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [DESIGN_BRIEF.md](DESIGN_BRIEF.md).

## 📝 Changelog

This repo keeps no changelog file. The history lives in the commits on `main`, design decisions in [docs/DECISIONS.ndjson](docs/DECISIONS.ndjson), and versioned architecture changes in the [spec changelog](https://github.com/Legimus-AI/ai-first-architecture/blob/main/CHANGELOG.md). The latest round, on 2026-10-04 (WEB-RESILIENCE-261007), made the app say what happened instead of breaking: a lost session goes to login and back, errors render inside the layout with a working retry, Spanish copy and validation everywhere, lists that clamp bad URLs and never show a false empty page, honest dashboard and demos, team actions by permission, password reset and email verification pages, mobile cards and no dark-mode flash. The same day (SUAVE-IDENTITY) the default look became the Suave identity: one token block re-skins the app, components carry no `dark:` or rgba values, icons go through `@/ui/icons`, and the design guard bans the generic template tells.
