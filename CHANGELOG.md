# Changelog

Versions of this web skeleton, newest first. Before 3.0.0 the history lives only in the commits on `main`.
Architecture decisions are in the [spec changelog](https://github.com/Legimus-AI/ai-first-architecture/blob/main/CHANGELOG.md).

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
