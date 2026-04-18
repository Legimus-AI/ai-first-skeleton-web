# `constants/` — Cross-Cutting Constants

Constants used by 2+ slices. Peer to `slices/`, `utils/`, `ui/`.

## When to put constants here

| Scope | Location |
|-------|----------|
| Used by 1 slice only | `slices/<name>/constants.ts` |
| Used by 2+ slices, <100 lines total | `utils/constants.ts` (single file) |
| Used by 2+ slices, >100 lines OR >4 domains | `constants/<domain>.ts` (this folder) |

Claude Code uses the same pattern: `src/constants/` with small domain-scoped files (`apiLimits.ts`, `betas.ts`, `errorIds.ts`, etc.).

## File naming

**Domain per file**, not type:

- `limits.ts` — rate limits, timeouts, max sizes
- `enums.ts` — shared union types + literal arrays
- `routes.ts` — route path constants
- `keys.ts` — localStorage/sessionStorage keys
- `errors.ts` — error codes + user-facing messages

## Contract

- No React imports
- No I/O (no fetch, no api-client)
- No slice imports
- Export constants only (`as const`, `Readonly<>`, or frozen objects). No functions (those go in `utils/`).

## Example

```typescript
// constants/limits.ts
export const MAX_UPLOAD_SIZE_MB = 10 as const
export const DEFAULT_PAGE_SIZE = 20 as const
export const MAX_PAGE_SIZE = 100 as const
```

```typescript
// constants/enums.ts
export const USER_ROLES = ['admin', 'member', 'guest'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_ROLE_PATTERN = /^(admin|member|guest)$/
```

## Anti-patterns

```typescript
// ❌ Grab-bag file
// constants/misc.ts — architecture test rejects this

// ❌ Constants with side effects
// constants/limits.ts
import { api } from '@/utils/api-client'  // NO — constants are pure

// ❌ Functions in constants
// constants/errors.ts
export function formatError(code: string): string  // NO — this is a utility
```
