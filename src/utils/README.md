# `utils/` — Non-Visual Reusable Code

Frontend equivalent of backend `utils/` + a bit more. Follows React/TS idiomatic convention: this is the bucket for non-visual reusable code.

Peer to `slices/`, `ui/`, `constants/`.

## What goes here

- **Pure helpers** — `cn.ts` (classname merge), `format-date.ts`, `platform.ts`
- **Custom hooks** — `use-bulk-delete.ts`, `use-optimistic-mutation.ts`, `use-query-params.ts`
- **API client** — `api-client.ts`, `api-error.ts` (kept here while there's only 1 external client; promote to `services/` when a second is added)
- **React infra** — `theme-provider.tsx`

## What does NOT go here

| If it is... | Put it in... |
|-------------|--------------|
| A visual component (Button, Card, Dialog) | `ui/` |
| A slice resource (Todo, User) | `slices/<name>/` |
| A cross-cutting constant | `constants/<domain>.ts` |
| A second+ external API adapter (Stripe direct, Algolia) | Promote to `services/` (follow backend pattern) |

## File naming

**One concept per file**. Never a grab-bag `utils.ts` / `helpers.ts` / `common.ts` / `misc.ts`.

- Pure helpers → kebab-case by responsibility: `format-date.ts`, `cn.ts`
- Hooks → `use-<thing>.ts` (React convention)
- API client → `api-client.ts`, `api-error.ts`
- Context providers → `<thing>-provider.tsx`

## Convention vs backend

Frontend `utils/` is **broader** than backend `utils/`. Backend separates `services/` (external I/O) strictly. Frontend keeps `api-client.ts` here because:
- There's usually only ONE external client (the backend).
- React ecosystem convention (shadcn, tanstack-query examples) puts it in `lib/` (now `utils/`).
- Hooks and API calls are tightly coupled in React.

**When to promote to `services/`:** if you add Stripe-direct, Algolia, SendGrid, or any second external client called DIRECTLY from the frontend (not via backend), create `src/services/` and move `api-client.ts` there for symmetry.

## Anti-patterns

```typescript
// ❌ Grab-bag
// utils/utils.ts — rejected by architecture test
// utils/helpers.ts — rejected
// utils/common.ts — rejected

// ❌ Visual component here
// utils/modal.tsx — goes in ui/ instead
```
