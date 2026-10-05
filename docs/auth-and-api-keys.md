# Authentication and API Keys

What the web app does for sign-in and for API keys. The backend owns the rules (sessions, roles, scopes); this repo renders the flows.

## Authentication

Session-based auth with login, register, and logout flows. Protected routes redirect unauthenticated users to `/login`.

| Route | Description |
|-------|-------------|
| `/login` | Email + password sign-in, plus a Google button when `VITE_GOOGLE_AUTH=true`. `?redirect=<path>` returns there after sign-in (only a page on this site other than the auth pages, checked again right before navigating); `?error=oauth` shows "No pudimos iniciar sesión con Google"; a signed-in user is sent on |
| `/register` | Create a new account (name, email, password); a signed-in user goes to `/dashboard` |
| `/forgot-password` | Asks for an email and sends a reset link (`POST /api/v1/auth/forgot-password`) |
| `/reset-password?token=` | Sets a new password (`POST /api/v1/auth/reset-password`); `&invited=1` shows "Crea tu contraseña" for invited members |
| `/verify-email?token=` | One click confirms the email (`POST /api/v1/auth/verify-email`); opening the link alone changes nothing |
| `/` | Protected; redirects to `/dashboard` (and to `/login` if not authenticated) |
| `/profile` | Protected; user info and edit form |
| `/settings/*` | Protected; general, notifications, security, team, API keys |

Auth state is managed via TanStack Query (`useCurrentUser`, `authQueryOptions` in `src/slices/auth/hooks/use-auth.ts`), re-checked after 60 s and on window focus, because a session can end server-side at any time. Login and register clear the whole cache first, so one account never sees another's data. A 401 anywhere else sends the user to `/login?redirect=…` (see [api-client.md](api-client.md)). The `_authed` layout route (`src/routes/_authed.tsx`) checks auth in `beforeLoad` before rendering any child route and shows a skeleton while it waits. Auth state lives only in TanStack Query; there is no React Context for it.

## API Key Management

Authenticated users can create and revoke API keys at `/settings/api-keys`. Keys provide programmatic access to the API using Bearer token authentication.

- **Create:** Name a key and receive the raw token (shown once, with a copy button; copy it immediately)
- **Revoke:** Permanently invalidate a key with a confirmation dialog
- **Usage:** `Authorization: Bearer ak_live_...` header

The page is reachable from the Settings section of the navigation and from the user menu.

### What a key created here can do

The form offers three presets and the table shows each key's permissions:

| Preset | Scopes | Who sees it |
|--------|--------|-------------|
| Solo lectura | `*:read` | everyone (default) |
| Lectura y escritura | `*:read`, `*:write` | everyone |
| Acceso total | `full` | roles that hold `full` (owner, admin) |

`*:action` never covers the reserved resources (team, API keys, webhooks, audit, approvals). A key never exceeds its creator's role, and with the TypeScript backend skeleton it reaches only the routes marked for agents (`x-agent`); destructive calls ask for an approval.

For other scope combinations, create the key through the API (`POST /api/v1/auth/api-keys` with `scopes`) or with the backend's agent CLI:

```bash
printf %s "$PASSWORD" | pnpm agent login --email you@example.com --scopes todos:read,todos:write
```

Scopes, approvals of destructive calls, MCP and the CLI: the backend's [agent surface guide](https://github.com/Legimus-AI/ai-first-skeleton-typescript/blob/main/docs/agent-surface.md).
