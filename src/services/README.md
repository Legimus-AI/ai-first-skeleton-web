# `services/` — External Adapters

Side-effect-heavy modules that talk to the outside world: HTTP, SSE, WebSocket, browser APIs (Push, Notifications, Geolocation), persistent storage.

Peer to `slices/`, `hooks/`, `utils/`, `providers/`, `constants/`.

## Contract

- **No slice imports** (`from @/slices/*` blocked by architecture test)
- **No React APIs** — no `useState`, `useEffect`, no JSX. Pure async functions or classes
- **Typed I/O** — request/response shapes live here (or import from `@repo/shared`)
- **Domain-agnostic** — a service would work verbatim in a different app of the same stack

## File naming

One adapter per file, named by target:

- `api-client.ts` — HTTP client to our backend (CSRF, auth, retries)
- `api-error.ts` — typed error + safeParseResponse helpers
- `sse-client.ts` — Server-Sent Events client (streaming)
- `push-service.ts` — wrappers for `PushManager`, `ServiceWorkerRegistration.showNotification`
- `storage-service.ts` — typed localStorage/IndexedDB wrappers

## When to add a file here

| Scope | Location |
|-------|----------|
| Calls backend / external HTTP | `services/<name>.ts` (here) |
| Wraps a browser Web API (Push, Geolocation, Clipboard) | `services/<name>-service.ts` (here) |
| React hook that uses a service | `hooks/use-<name>.ts` (peer folder) |
| Domain-specific API (only 1 slice uses it) | `slices/<name>/api.ts` |

## Anti-patterns

```ts
// ❌ Slice import
// services/api-client.ts
import { CurrentUser } from '@/slices/auth/schemas' // NO — services don't know domain

// ❌ React in a service
// services/push-service.ts
import { useState } from 'react' // NO — services are plain async/classes

// ❌ Creating a grab-bag file
// services/utils.ts  // ❌ rejected by architecture test
// services/common.ts // ❌
// services/helpers.ts // ❌
```

See ADR 0012 (frontend-structure) in ai-first-architecture spec.
