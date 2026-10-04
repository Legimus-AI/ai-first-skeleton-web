# Authentication and API Keys

What the web app does for sign-in and for API keys. The backend owns the rules (sessions, roles, scopes); this repo renders the flows.

## Authentication

Session-based auth with login, register, and logout flows. Protected routes redirect unauthenticated users to `/login`.

| Route | Description |
|-------|-------------|
| `/login` | Email + password sign-in, plus a Google button when `VITE_GOOGLE_AUTH=true` |
| `/register` | Create a new account (name, email, password) |
| `/` | Protected; redirects to `/dashboard` (and to `/login` if not authenticated) |
| `/profile` | Protected; user info and edit form |
| `/settings/*` | Protected; general, notifications, security, team, API keys |

Auth state is managed via TanStack Query (`useCurrentUser`, `authQueryOptions` in `src/slices/auth/hooks/use-auth.ts`) with infinite stale time — only refetched on explicit login/logout. The `_authed` layout route (`src/routes/_authed.tsx`) checks auth in `beforeLoad` before rendering any child route and shows a skeleton while it waits. Auth state lives only in TanStack Query; there is no React Context for it.

## API Key Management

Authenticated users can create and revoke API keys at `/settings/api-keys`. Keys provide programmatic access to the API using Bearer token authentication.

- **Create:** Name a key and receive the raw token (shown once, with a copy button; copy it immediately)
- **Revoke:** Permanently invalidate a key with a confirmation dialog
- **Usage:** `Authorization: Bearer ak_live_...` header

The page is reachable from the Settings section of the navigation and from the user menu.

### What a key created here can do

The form sends only a name, so the backend gives the key its default scope, `*:read`: it can read, never write. With the TypeScript backend skeleton a key also reaches only the routes marked for agents (`x-agent`), within its owner's role.

To get a key with write scopes until the form offers them, create it through the API (`POST /api/v1/auth/api-keys` with `scopes`) or with the backend's agent CLI:

```bash
printf %s "$PASSWORD" | pnpm agent login --email you@example.com --scopes todos:read,todos:write
```

Scopes, approvals of destructive calls, MCP and the CLI: the backend's [agent surface guide](https://github.com/Legimus-AI/ai-first-skeleton-typescript/blob/main/docs/agent-surface.md).
