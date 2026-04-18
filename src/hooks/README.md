# `hooks/` — Cross-Slice React Hooks

Generic React hooks used by 2+ slices or by `ui/` primitives. Peer to `slices/`, `services/`, `utils/`, `providers/`, `constants/`.

## Contract

- **No slice imports** — a hook here must NOT know about product, assistant, conversation, or any domain entity
- **Black-box rule:** *"Would this hook work verbatim in a different app of the same stack (TanStack + Tailwind) but different domain (e.g., switch from AI chat to e-commerce)?"* — if yes, it belongs here; if no, put it in `slices/<X>/hooks/`
- **May use `services/`** — hooks consume adapters (e.g., `use-push-notifications.ts` calls `services/push-service.ts`)
- **File prefix `use-`** — enforced by architecture test

## File naming

One hook per file:

- `use-bulk-delete.ts` — generic list bulk-delete state + dialog
- `use-optimistic-mutation.ts` — TanStack Query optimistic update helper
- `use-query-params.ts` — list pagination/sort/search URL state
- `use-push-notifications.ts` — browser Push subscription state

## When to add a file here

| Scope | Location |
|-------|----------|
| Hook used by 1 slice, domain-specific | `slices/<name>/hooks/use-<name>.ts` |
| Hook used by 2+ slices, domain-agnostic | `hooks/use-<name>.ts` (here) |
| Side-effect logic without React | `services/<name>.ts` |
| Pure function (no React) | `utils/<name>.ts` |

## Anti-patterns

```ts
// ❌ Domain reference in top-level hook
// hooks/use-product-filter.ts
import type { Product } from '@/slices/products/schemas' // NO — belongs in slices/products/hooks/

// ❌ Not prefixed with use-
// hooks/bulk-delete.ts // ❌ must be use-bulk-delete.ts

// ❌ Grab-bag
// hooks/common.ts, hooks/misc.ts // ❌ rejected by architecture test
```

See ADR 0012 (frontend-structure) in ai-first-architecture spec.
