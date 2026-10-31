# Changelog

Versions of this web skeleton, newest first. Before 3.0.0 the history lives only in the commits on `main`.
Architecture decisions are in the [spec changelog](https://github.com/Legimus-AI/ai-first-architecture/blob/main/CHANGELOG.md).

## Unreleased — 2026-10-31: no junk tests

- **`AGENTS.md` Tests:** value gate, what never to test (copy, layout, styling, class names, static rendering, library behaviour) and a test audit before finishing.
- **`pnpm install`** no longer fails when a global `core.hooksPath` makes `lefthook install` refuse: `prepare` warns.
- **Removed tests that proved nothing:** `split-pane.test.tsx` (rendered text, tag names, class names), `board-page.test.tsx` (static column titles and seed data) and the chat page's seeded-message check.

## Unreleased: account lifecycle

### Added

- `/settings/security`: change password (current one required), change email (approved from the current address, then confirmed from the new one), the
  list of sessions with "close" and "close the others", export your data (JSON) and delete the account
  (password confirmation; a 409 for the last owner of a shared organization is explained).
- Team: an owner can pick `Propietario` for a member (confirmation), resend a pending invitation, and
  leave the organization (the API ends their sessions and creates a fresh personal one; the page goes to
  `/login`). Resending an expired invitation replaces it. `/settings/general`: rename the
  organization (owner and admin).
- `/settings/audit` for owners and admins, and `/admin` (platform admins only: list users, ban, unban).
  The menu shows `/admin` when `GET /api/v1/auth/me` answers `isPlatformAdmin: true`. These need the
  TypeScript backend's matching endpoints.

### Changed

- The architecture test allows `auth-client.ts` up to 800 lines (INVARIANTS #16): the Better Auth client
  cannot be exported, so every endpoint's function lives beside it.
- `updateMemberRole` accepts `owner`; the architecture test lets `settings` import from `auth`.
- `navItemsFor(grants, isPlatformAdmin)` takes the platform-admin flag; the architecture test lets
  `admin` import from `auth`.

## Unreleased: security hardening

### Added

- `safeUrl` (`utils/safe-url.ts`), used by the breadcrumb for any `href`.
- `dependabot.yml` (npm and github-actions); the CI workflow has `permissions: contents: read`, actions
  pinned by commit SHA and the Biome binary checked against its SHA-256.

### Changed

- **`/device` no longer reads `?user_code=`:** the person types the code and the page warns to approve
  only a code started from their own terminal (device-code phishing). Backends that print a link with
  the code still work: the link opens the empty form.
- The reset-password page removes the token from the URL once read.
- The service worker opens only same-origin URLs, and signing out removes the device's push subscription.
- The Clarity recipe sets `content: false` (it masked nothing before).

## Unreleased: settings that follow the account

The organization chooses its time zone and date format, and each person their theme and time zone,
saved through the API so they follow the account to any device. Implements
[ADR 0024](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0024-runtime-settings-per-organization-and-user.md).

### Breaking

- **The signed-in shell needs the settings endpoints:** `_authed` loads `GET /api/v1/me/settings` and
  `GET /api/v1/organization/settings` before any page renders, and the pages `PATCH` them. They need the
  TypeScript backend with the `settings` slice, and every member role must hold `organization:read`.
- **`@/utils/format-date` is now `@/services/date-format-service`:** `formatDate`, `formatDateTime` and
  `formatRelative` hold the runtime locale and time zone, and `utils/` stays pure. Update the imports.
- **The `Theme` type moved from `@/providers/theme-provider` to `@repo/shared`** (with `themeSchema` and
  `THEMES`): `import type { Theme } from '@repo/shared'` (e.g. a product's `ui/theme-segmented.tsx`).

### Added

- `/settings/general`: the organization's time zone and date format (owner and admin edit them, members
  see them read-only), each field restorable to its default. `/settings/preferences`: the person's theme
  and time zone, which can follow the organization's. Every form page under Configuración (general,
  preferences, security, notifications) uses the `narrow` layout.
- Dates show in the organization's locale, in the person's time zone or else the organization's. Pages
  outside the signed-in shell keep `VITE_LOCALE` and the browser's zone. A zone the browser cannot format
  falls back to the device's zone, with a warning once in the shell and on both settings pages.
- The theme is saved to the account: the account's theme wins on the first load of a session, and every
  later toggle is saved once; a failed save puts the last confirmed theme back.
- When the session's account changes in another tab, the shell drops the cached data and reloads it.
- `useOptimisticMutation` takes `successMessage: false` (no success toast) and `scope` (saves run one at
  a time).
- `getFormatLocale()` in `@/services/date-format-service`: the locale the dates use, for a product's
  number and money formatters, so amounts follow the same setting as dates.

### Changed

- The API key presets Solo lectura and Lectura y escritura also grant `organization:read` (read only: the
  organization's time zone and locale), so an agent using one can read the organization's settings. The
  OAuth consent page names it "Ver la configuración de la organización". Keys made before keep their
  scopes, and the table lists them as they are.

## 3.1.0 — 2026-10-07: the latest toolchain

TypeScript 7, the native compiler: the web typechecks in 1.11 s instead of 4.49 s
(`tsc --extendedDiagnostics`, same code). Every dependency moves to its latest version.

- **Majors:** TypeScript 7.0, Vitest 5, commitlint 21, jsdom 30, tailwind-merge 3, TanStack Table 9.
- **Minors:** React 19.3, Vite 8.3, TanStack Router and Query, Tailwind 4.3, Biome 2.5, Zod 4.6, the
  Radix primitives.
- **TypeScript 7** no longer adds every installed `@types` package: `tsconfig.json` names `node`.
- **TanStack Table 9:** the DataTable builds the table with `useTable` and an empty feature set.
  Its public `Column` API is unchanged.
- **Fixed:** a column marked `sortable` is a header button again that toggles asc ⇄ desc. TanStack
  sorts only accessor columns, so no header had ever become a button; the server sorts, so the
  header now calls `onSortChange` directly, and the sorted column carries `aria-sort`.

## 3.0.0 — 2026-10-07: the agentic era

Every agent can now connect to a product built from the skeletons, and this app is where a person lets
them in and takes them out. Identity moved to Better Auth on the API, so this version breaks
compatibility. Implements AI-First Architecture v3.0.0 ([ADR 0022](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0022-better-auth-identity-skeleton-authorization-mcp-oauth.md)).

### Breaking

- **Sign-in, sign-up, sign-out, password reset, email verification and Google** call Better Auth's
  `/api/auth/*` through `src/slices/auth/auth-client.ts`, the app's only `better-auth` import (named
  exception to INVARIANTS #7). They need the TypeScript backend 3.0.0; the FastAPI backend does not serve
  these endpoints yet, so a FastAPI project stays on the last commit before 3.0.0 (`2990a40`).
- **Team changes** (invite, change role, remove) go through Better Auth's organization endpoints.
- **Invitations** open `/accept-invitation`; the reset-password page no longer handles them.
- **Every user signs in again once:** sessions are not carried over.

### Added

- `/oauth/consent`: an MCP client's name, the host that receives the access, a loopback warning and the
  scopes in plain Spanish; approve or deny.
- `/device`: approve or deny a CLI login (OAuth device grant).
- The login and sign-up resume an app's OAuth request (`oauth_query`) and follow the `url` Better Auth
  returns.
- "Apps conectadas" on the API keys page: every OAuth app signed in with the account, each revocable;
  the list reads the shared `oauthConnectionsResponseSchema`.
- "Invitaciones pendientes" on the team page: owners and admins see who was invited and has not joined
  (email, role, expiry), newest first and paged from `GET /api/v1/team/invitations`, and can cancel an
  invitation.
- Cloudflare Turnstile on login, sign-up and password reset (`VITE_TURNSTILE_SITE_KEY`).
- Vite proxies `/.well-known/oauth-*` and `/.well-known/openid-configuration` to the API in development.

### Upgrade

`/sync-skeleton` brings these commits into `apps/web/` together with the backend's. In production nginx
must send the OAuth discovery documents to the API and leave `/login`, `/oauth/consent`, `/device` and
`/accept-invitation` to the SPA; the backend's `nginx/app.conf` does both.
