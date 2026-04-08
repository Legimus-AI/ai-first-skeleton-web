# API Client

Backend-agnostic fetch wrapper (`src/lib/api-client.ts`) — works with any AI-First Skeleton backend.

## Usage

```ts
import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'

// GET with query params
const res = await api.get('/api/todos', { page: '1', limit: '20' })
await throwIfNotOk(res)
const json = await res.json()

// POST with body
const res = await api.post('/api/todos', { title: 'Buy milk' })

// PATCH with path param + body
const res = await api.patch(`/api/todos/${id}`, { completed: true })

// DELETE
const res = await api.delete(`/api/todos/${id}`)
```

Response types come from `@repo/shared` (Zod schemas), validated at runtime.

## Error Handling

All API errors are typed and structured:

```typescript
import { throwIfNotOk } from '@/lib/api-error'

const res = await api.get('/api/todos')
await throwIfNotOk(res) // throws ApiError { code, message, requestId }
```

Error codes from `@repo/shared`: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

For granular error handling:

```typescript
import { parseApiError } from '@/lib/api-error'

const error = await parseApiError(res) // { code, message, requestId? }
if (error.code === 'NOT_FOUND') { /* handle */ }
```
