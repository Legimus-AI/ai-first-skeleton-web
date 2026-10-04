# API Client

Backend-agnostic fetch wrapper (`src/services/api-client.ts`) — works with any AI-First Skeleton backend. It sends cookies (`credentials: 'include'`), sets the JSON content type when there is a body, and exposes the `X-Request-Id` response header as `res.requestId`.

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

`parseApiError()` understands both the AI-First error format (`{ error: { code, message, requestId, fields } }`) and FastAPI's 422 validation format (`{ detail: [...] }`), so the same client works with both backend skeletons.
