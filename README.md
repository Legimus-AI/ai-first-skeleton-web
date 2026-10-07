# AI-First Skeleton — Web Frontend

React 19 + TanStack Router + TanStack Query + Tailwind v4 frontend for the [AI-First Architecture](https://github.com/Legimus-AI/ai-first-architecture) v3.0.0 skeletons.
It is a component repo: a backend skeleton's `scripts/setup.sh` clones it into `apps/web/`, where it takes its types from `@repo/shared` and talks to the API through a plain fetch wrapper.

**Version 3.0.0, the agentic era (2026-10-07).** Every agent can connect to the product, and this app is where a person approves it: OAuth consent for MCP clients, CLI login approval and a list of connected apps to revoke. Sign-in moved to Better Auth, so 3.0.0 breaks compatibility: see [Upgrading a project born before 3.0.0](#️-upgrading-a-project-born-before-300) and [CHANGELOG.md](CHANGELOG.md). **3.1.0** moves to the latest toolchain: TypeScript 7's native compiler typechecks the web 4 times faster.

## 🚀 Quick start

This frontend cannot run standalone: it depends on `@repo/shared` from the backend workspace. Start from a backend skeleton and let its setup install this repo:

```bash
git clone https://github.com/Legimus-AI/ai-first-skeleton-typescript.git my-app
cd my-app
./scripts/setup.sh --db postgres   # clones this repo into apps/web/ and stamps .skeleton-version
```

Then follow the backend's quick start to run the API, and start this app with `pnpm dev:web` (TypeScript backend) or `make dev` (FastAPI backend, API + web together). The app runs on http://localhost:5173 and Vite proxies `/api/`, `/mcp` and the OAuth discovery documents (`/.well-known/oauth-*`, `/.well-known/openid-configuration`) to the backend (`VITE_API_URL`, default `http://localhost:3000`).

Optional browser variables: `VITE_GOOGLE_AUTH=true` shows "Continuar con Google", and `VITE_TURNSTILE_SITE_KEY` turns on the Cloudflare Turnstile captcha on login, sign-up and password reset (the API needs `TURNSTILE_SECRET_KEY`).

Cloning by hand works too, but then no stamp records which commit of this repo the project started from:

```bash
git clone https://github.com/Legimus-AI/ai-first-skeleton-web.git apps/web
rm -rf apps/web/.git
pnpm install
```

## 🔌 Compatible backends

- [ai-first-skeleton-typescript](https://github.com/Legimus-AI/ai-first-skeleton-typescript) (TypeScript — PostgreSQL/Drizzle or MongoDB/Mongoose), the reference implementation
- [ai-first-skeleton-fastapi](https://github.com/Legimus-AI/ai-first-skeleton-fastapi) (Python — FastAPI/SQLAlchemy or Beanie), for the data pages only: from 3.0.0 sign-in, the team, invitations and OAuth call Better Auth's `/api/auth/*`, which the FastAPI backend does not serve yet ([ADR 0022](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0022-better-auth-identity-skeleton-authorization-mcp-oauth.md) keeps its own sessions and keys). A FastAPI project stays on this repo's last commit before 3.0.0 (`2990a40`).

Any backend that follows the AI-First API contract works for the data pages: `/api/v1/<slice>` paths, `{ data, meta }` for lists, `{ data }` for one record, `{ error: { code, message, requestId } }` for errors. The auth pages also need Better Auth under `/api/auth/*` and `GET /api/v1/auth/me`.

## 🧰 What you get

| | Capability | What you get | Guide |
|---|---|---|---|
| 🔐 | Auth flows | Better Auth through one client file (`src/slices/auth/auth-client.ts`): login, register, optional Google button and Turnstile captcha, password reset, email verification, invitation acceptance, an `_authed` route guard with a pending skeleton, profile and settings pages | [Auth and API keys](docs/auth-and-api-keys.md) |
| 🤝 | OAuth for agents | `/oauth/consent` for MCP clients (app name, the host that receives the access, a loopback warning, scopes in plain Spanish) and `/device` to approve a CLI login; the login resumes an app's OAuth request | [Auth and API keys](docs/auth-and-api-keys.md#authentication) |
| 🔑 | API key page | Create (token shown once, with copy) and revoke keys at `/settings/api-keys`, with scope presets (read only, read and write, full access for owner/admin) shown in the table, how to connect an agent (MCP URL and CLI variables), and "Apps conectadas": the OAuth apps signed in with the account, each one revocable | [Auth and API keys](docs/auth-and-api-keys.md#what-a-key-created-here-can-do) |
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

## 🤖 Every agent connects

Agents that use the product never drive this UI: they call the backend's `/mcp` (or its CLI) with an OAuth connection or an API key. This app is where a person lets them in and takes them out again: the login resumes an app's OAuth request, `/oauth/consent` approves it, `/device` approves a CLI login, `/settings/api-keys` creates keys, and "Apps conectadas" lists every OAuth app with a one-click revoke.

| Agent | Signs in with | What the person does in this app |
|---|---|---|
| Claude.ai | OAuth (CIMD) | Signs in if needed, then approves at `/oauth/consent` |
| ChatGPT | OAuth, when Developer mode is on | Same as Claude.ai (not tried yet: Developer mode is off on the owner's account) |
| Grok Bot | OAuth (DCR) or an API key | Approves at `/oauth/consent`, or creates a key at `/settings/api-keys` |
| Claude Code | OAuth (CIMD) or an API key | Approves at `/oauth/consent` (the page warns that the redirect is this computer), or creates a key |
| Codex | API key | Creates a key at `/settings/api-keys`; the page shows the MCP URL and header to paste |
| The backend's CLI | OAuth device grant, speaks `/mcp` | Opens `/device?user_code=…`, checks the code matches the terminal, approves |

How each client is configured on its side: the backend's README ([TypeScript](https://github.com/Legimus-AI/ai-first-skeleton-typescript#-every-agent-connects)) and [agent surface guide](https://github.com/Legimus-AI/ai-first-skeleton-typescript/blob/main/docs/agent-surface.md). The key page offers read-only, read-and-write and (for owner/admin) full-access keys; other scope sets go through the API (`POST /api/v1/auth/api-keys` with `scopes`, from a session).

## 🔐 Auth in a few lines

- **Better Auth (MIT, 1.7.7) owns identity on the API**, behind an endpoint allowlist; the API keeps authorization (permissions, the agent gate, audit) behind one seam, `principal.ts` ([ADR 0022](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0022-better-auth-identity-skeleton-authorization-mcp-oauth.md)).
- **`src/slices/auth/auth-client.ts` is this app's only Better Auth import.** One typed function per `/api/auth/*` endpoint it calls, so the file is also the list the API's allowlist must serve. It is the named exception to INVARIANTS #7 (INV-030 in the spec): Better Auth's client builds those requests, but they still travel through the api-client.
- **Who is signed in stays on REST** (`GET /api/v1/auth/me`): the app needs the role of the live membership, which Better Auth's session does not carry.
- **Security the person sees:** the Turnstile captcha on login, sign-up and reset (when `VITE_TURNSTILE_SITE_KEY` is set), breached passwords refused, the per-email lockout message with its wait, CSRF (cookie writes only from the allowed origins), a revoke that stops the app's next call, and a removed member sent back to login on the next request.

## ⚙️ Setup changes in 3.0.0

- `VITE_TURNSTILE_SITE_KEY` (optional) turns the captcha on; the API needs `TURNSTILE_SECRET_KEY`.
- In production nginx must send `/.well-known/oauth-*` and `/.well-known/openid-configuration` to the API and leave `/login`, `/oauth/consent`, `/device` and `/accept-invitation` to this app (the backend's `nginx/app.conf` does both). Vite does the same in development.
- The consent (`/oauth/consent`) and CLI approval (`/device`) pages must never load inside a frame, or another site could overlay them and steal the click that grants access. The backend's `nginx/app.conf` sends `Content-Security-Policy: frame-ancestors 'none'` for the whole app; any other host or CDN that serves it must send that header too.
- Google sign-in goes through the API: its redirect URI is now `<API_PUBLIC_URL>/api/auth/callback/google`.
- The API needs `BETTER_AUTH_SECRET` and `API_PUBLIC_URL` in production.

## ⬆️ Upgrading a project born before 3.0.0

`/sync-skeleton` brings this repo's commits into `apps/web/` together with the backend's (its README has the data migration and the rollback). Every user signs in again once, because the old sessions are not carried over; passwords and API keys keep working. Invitation emails now open `/accept-invitation`, and the reset-password page no longer handles invitations.

## 🛠️ Coding agents

[`AGENTS.md`](AGENTS.md) holds the instructions; `CLAUDE.md` is an adapter that only imports `AGENTS.md`, `INVARIANTS.md` and `DESIGN_SYSTEM.md`. Claude Code also gets a stop hook (architecture test before it finishes), path-scoped rules and a deny rule for `.env`; they load only when the session starts inside the repo. Details: [docs/agent-guardrails.md](docs/agent-guardrails.md).

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

[CHANGELOG.md](CHANGELOG.md) lists each version from 3.0.0 on (2026-10-07, the agentic era: Better Auth, OAuth consent, CLI approval, invitations and connected apps). Older history lives in the commits on `main`, design decisions in [docs/DECISIONS.ndjson](docs/DECISIONS.ndjson), and versioned architecture changes in the [spec changelog](https://github.com/Legimus-AI/ai-first-architecture/blob/main/CHANGELOG.md). The round before 3.0.0, on 2026-10-04 (WEB-RESILIENCE-261007), made the app say what happened instead of breaking: a lost session goes to login and back, errors render inside the layout with a working retry, Spanish copy and validation everywhere, lists that clamp bad URLs and never show a false empty page, honest dashboard and demos, team actions by permission, password reset and email verification pages, mobile cards and no dark-mode flash. The same day (SUAVE-IDENTITY) the default look became the Suave identity: one token block re-skins the app, components carry no `dark:` or rgba values, icons go through `@/ui/icons`, and the design guard bans the generic template tells.
