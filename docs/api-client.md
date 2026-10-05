# API Client

Backend-agnostic fetch wrapper (`src/services/api-client.ts`) — works with any AI-First Skeleton backend. It sends cookies (`credentials: 'include'`), sets the JSON content type when there is a body, exposes the `X-Request-Id` response header as `res.requestId`, ends every request after `REQUEST_TIMEOUT_MS` (15 s), and turns a request with no response (offline, timeout) into `ApiError` with `status: 0`.

In a `queryFn`, pass TanStack Query's `signal` so leaving a page cancels its requests: `queryFn: ({ signal }) => api.get('/api/v1/todos', params, signal)`.

## Usage

```ts
import { api } from '@/services/api-client'
import { throwIfNotOk } from '@/services/api-error'

// GET with query params
const res = await api.get('/api/v1/todos', { page: '1', limit: '20' })
await throwIfNotOk(res)
const json = await res.json()

// POST with body
const res = await api.post('/api/v1/todos', { title: 'Buy milk' })

// PATCH with path param + body
const res = await api.patch(`/api/v1/todos/${id}`, { completed: true })

// DELETE (an optional body is supported, e.g. for bulk deletes)
const res = await api.delete(`/api/v1/todos/${id}`)
```

Response types come from `@repo/shared` (Zod schemas), validated at runtime with `safeParseResponse()` from `@/services/api-error`.

## Error Handling

All API errors are typed and structured:

```typescript
import { throwIfNotOk } from '@/services/api-error'

const res = await api.get('/api/v1/todos')
await throwIfNotOk(res) // throws ApiError { code, message, requestId, fields }
```

Error codes from `@repo/shared`: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

For granular error handling:

```typescript
import { parseApiError } from '@/services/api-error'

const error = await parseApiError(res) // ApiError { code, message, requestId?, fields? }
if (error.code === 'NOT_FOUND') { /* handle */ }
```

`ApiError` also carries `status`, `path` and `retryAfter` (seconds, from a 429's `Retry-After`).

## What the user sees

Backend messages stay English (they are for API consumers). The UI never shows them:

- `toUserMessage(error)` (`@/services/api-error`) maps status and code to Spanish copy: "No pudimos conectar con el servidor" for no response or 502/503/504, how long to wait on a 429, "Ya existe una cuenta con este email." on a `CONFLICT` with `fields.email`. Use it in every toast description.
- `setFieldErrors(error, form.setError)` puts a Spanish message under each field listed in `error.fields`. Call it from the mutation's `onError` in forms.
- `<InlineError error={error} onRetry={...} />` is the one error screen: the message, "Copiar detalles" (code, status, `requestId`, URL; never cookies) and "Reintentar". Retry with `refetch()` in components and `router.invalidate()` in route errors, never a page reload.

## Session, retries and route errors (one place: `src/services/query-client.ts`)

- **401:** the `QueryCache` and `MutationCache` `onError` treat a 401 outside `/auth/me`, `/auth/login` and `/auth/register` as a lost session: they clear the cache and go to `/login?redirect=<current path>`. Hooks never handle 401 themselves. After signing in, the user returns to `redirect` (same-origin paths only).
- **Retries:** once, and only for no response or a 5xx. A 4xx is never retried.
- **Auth:** the current user is re-checked after 60 s and on window focus; the `_authed` guard revalidates it in the background.
- **Route errors:** `defaultErrorComponent` renders `RouteError` where the failing route renders, so the layout and menu stay. The root `ErrorBoundary` resets when the location changes and `<Toaster/>` lives outside it.

`parseApiError()` understands both the AI-First error format (`{ error: { code, message, requestId, fields } }`) and FastAPI's 422 validation format (`{ detail: [...] }`), so the same client works with both backend skeletons.
