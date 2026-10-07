# Authentication and API Keys

What the web app does for sign-in, OAuth apps (MCP clients and the CLI), the team and API keys. The backend owns the rules (sessions, roles, scopes); this repo renders the flows.

## Authentication

Identity is Better Auth's ([ADR 0022](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0022-better-auth-identity-skeleton-authorization-mcp-oauth.md)): sign-in, sign-up, sessions, the email flows, Google, invitations and the OAuth server for MCP clients live under `/api/auth/*` on the API. The web app calls them only through `src/slices/auth/auth-client.ts`, the one file that imports `better-auth` (INVARIANTS #7 named exception). It exports one typed function per endpoint, so it is also the list of endpoints the API's allowlist must serve. Its requests still travel through the api-client (`api.send`: same 15 s limit and network errors), and a failure throws `AuthApiError` (an `ApiError` with Better Auth's `authCode`). `authErrorMessage` (`auth-error.ts`) turns each code into Spanish, including the login lockout (429) with its `Retry-After` wait.

| Route | What it does | Better Auth endpoint |
|-------|--------------|----------------------|
| `/login` | Email + password, plus Google when `VITE_GOOGLE_AUTH=true`. `?redirect=<path>` returns there after sign-in (only a page on this site other than the auth pages, checked again before navigating); `?error=` (set by Better Auth when Google fails) shows "No pudimos iniciar sesión con Google", or, for `account_not_linked` (an account with that email whose email is not confirmed yet), points to "¿Olvidaste tu contraseña?": the reset confirms the email, and Google links on the next try; a signed-in user is sent on. With `?oauth_query=` it resumes an app's OAuth authorization (below) | `POST /sign-in/email`, `POST /sign-in/social` |
| `/register` | Name, email, password; Better Auth signs the new account in. Takes `redirect` and `oauth_query` like `/login` | `POST /sign-up/email` |
| `/forgot-password` | Asks for an email and sends a reset link | `POST /request-password-reset` |
| `/reset-password?token=` | Sets a new password; Better Auth ends the account's other sessions | `POST /reset-password` |
| `/verify-email?token=` | One click confirms the email; opening the link alone changes nothing | `GET /verify-email` |
| `/accept-invitation?token=` | The invitation email's link: sign in or create the account with that email, then accept or reject. Better Auth asks for a confirmed email first; the page offers to resend the link | `GET /get-session`, `GET /organization/get-invitation`, `POST /organization/accept-invitation`, `POST /organization/reject-invitation`, `POST /send-verification-email` |
| `/oauth/consent?oauth_query=` | Signed in only. An MCP client asks for access: its name, the host that receives the access, a warning when that host is this computer (localhost, 127.x, `::1`), and the requested scopes in plain Spanish (`*:read` "Leer tus datos", `*:write` "Crear y modificar datos"). Permitir or Rechazar sends the browser back to the app | `GET /oauth2/public-client`, `POST /oauth2/consent` |
| `/device?user_code=` | Signed in only. The CLI's login (OAuth device grant): the person types or sees the code, checks the app and scopes, and approves or denies | `GET /device`, `POST /device/approve`, `POST /device/deny` |
| `/` | Protected; redirects to `HOME_PATH` (and to `/login` if not authenticated) | |
| `/profile` | Protected; user info and the name form | `POST /update-user` |
| `/settings/*` | Protected; general, notifications, security, team, API keys | |

Logout is `POST /sign-out` (user menu). `/oauth/consent` and `/device` sit under the pathless `src/routes/_session.tsx`: it checks the session like `_authed` and sends a signed-out person to `/login?redirect=<this page>`, without the app shell.

**Who is signed in** stays on REST: `useCurrentUser` / `authQueryOptions` (`src/slices/auth/hooks/use-auth.ts`) read `GET /api/v1/auth/me`, because the app needs the role and organization of the live membership. It is re-checked after 60 s and on window focus. Sign-in, sign-up, logout and accepting an invitation clear the whole cache, so one account never sees another's data. A 401 anywhere else sends the user to `/login?redirect=…` (see [api-client.md](api-client.md)). The `_authed` layout route checks auth in `beforeLoad` and shows a skeleton while it waits. Auth state lives only in TanStack Query; there is no React Context for it, and Better Auth's own React hooks are not used.

**OAuth resume.** When an MCP client starts an authorization and nobody is signed in, Better Auth sends the browser to `/login` with a signed query (its `loginPage`). That query lists its signed names in a repeated `ba_param`, which the router would re-encode as one JSON array and so break the signature. The router's `parseSearch` (`src/router.ts`, `utils/signed-oauth-query.ts`) folds it into one opaque `oauth_query` param before anything reads it. Signing in (email, sign-up or Google) posts it back as `oauth_query`, and the page follows the `url` Better Auth answers: the consent page (its `consentPage`, `/oauth/consent`) or the app itself.

**Captcha.** With `VITE_TURNSTILE_SITE_KEY` set (and `TURNSTILE_SECRET_KEY` on the API), the login, sign-up and forgot-password forms render a Cloudflare Turnstile widget and send its token in the `x-captcha-response` header, the one Better Auth's captcha plugin reads. A token is spent on every try, so the widget renews after each submit. Without the key nothing renders.

## API Key Management

Authenticated users can create and revoke API keys at `/settings/api-keys`. Keys provide programmatic access to the API using Bearer token authentication.

- **Create:** Name a key and receive the raw token (shown once, with a copy button; copy it immediately)
- **Revoke:** Permanently invalidate a key with a confirmation dialog
- **Usage:** `Authorization: Bearer ak_live_...` header
- **Connect an agent:** next to the new key, the page shows the MCP server (`<origin>/mcp` with `Authorization: Bearer <key>`) and the CLI setup (`AGENT_API_URL`, `AGENT_API_KEY`, `pnpm agent list`), each with a copy button. `/mcp` is served from the app's origin: nginx proxies it in production and Vite in development.

The page is reachable from the Settings section of the navigation and from the user menu.

### What a key created here can do

The form offers three presets and the table shows each key's permissions:

| Preset | Scopes | Who sees it |
|--------|--------|-------------|
| Solo lectura | `*:read` | everyone (default) |
| Lectura y escritura | `*:read`, `*:write` | everyone |
| Acceso total | `full` | roles that hold `full` (owner, admin) |

`*:action` never covers the reserved resources (team, API keys, webhooks, audit). A key never exceeds its creator's role, and with the TypeScript backend skeleton it reaches only the routes marked for agents (`x-agent`). A key with `*:write` deletes data in one call, with no approval. A key never changes who has access or where data is sent: inviting, changing roles and removing members, creating and revoking API keys, and creating, changing and deleting webhook destinations are refused to every key, `full` included, and stay in this web app.

For other scope combinations, create the key through the API with a session cookie, never another key (`POST /api/v1/auth/api-keys` with `scopes`), or use the backend's agent CLI, whose login you approve in the browser at `/device`:

```bash
pnpm agent login --scopes todos:read,todos:write   # approve in the browser; no password in the CLI
```

### Apps conectadas

Below the keys, the same page lists the apps that signed in with the account through OAuth: MCP clients (Claude, an editor, an agent) and the CLI. Each row shows the app's name, its permissions, when it connected and when it last got a token. **Desconectar** asks for confirmation and revokes the app at once: its tokens and consent go, so its next call to `/mcp` is refused.

| Call | Contract |
|------|----------|
| `GET /api/v1/auth/connections` | `{ data: [{ clientId, clientName, scopes, createdAt, lastUsedAt }] }` |
| `DELETE /api/v1/auth/connections/{clientId}` | 204; `clientId` is URL-encoded, because a client registered by metadata document has a URL as its id |

## Team and invitations

`/settings/team` lists the members over REST (`GET /api/v1/team`: paging, search, sort). Changes go through Better Auth's organization endpoints, which take only a session and refuse to remove or demote the last owner (the page shows that error):

| Action | Better Auth endpoint |
|--------|----------------------|
| Invite (email and role; the person accepts at `/accept-invitation`) | `POST /organization/invite-member` |
| Change a role | `GET /organization/list-members` (finds the membership id: the list is keyed by user id) then `POST /organization/update-member-role` |
| Remove one or several members | `POST /organization/remove-member`, one call per member, by email |

## Webhooks

Owners and admins manage webhooks at `/settings/webhooks`. The entry is hidden from other roles, and the API answers them 403. API keys cannot create, change or delete destinations; they can poll events with `webhooks:read`.

- **Destinations:** create one with a URL and the event types it receives, or `*` for all. The signing secret is shown once, with a copy button. Delete a destination with a confirmation.
- **Sent events:** newest first (`order=desc`). Each event shows its delivery state (Entregado, Pendiente, Fallido, Sin envíos), its attempts and the error behind that state, with Reenviar and a button for older events. The state comes from the latest send to each destination (`summarizeDeliveries`). While a send is pending, the list refreshes when the next attempt is due (`nextDeliveryRefresh`), never more often than the worker's 5 s poll. A failed send can wait hours for its retry. Deleting a destination deletes its sends, so its events show Sin envíos.
- **Events off:** the backend needs `EVENTS_ENABLED=true`. The destination list reports `eventsEnabled`; while it is false the page says how to turn events on and disables Crear destino and Reenviar. If a create still fails, the error shows inside the dialog.

Scopes, what a key may delete, MCP and the CLI: the backend's [agent surface guide](https://github.com/Legimus-AI/ai-first-skeleton-typescript/blob/main/docs/agent-surface.md).
