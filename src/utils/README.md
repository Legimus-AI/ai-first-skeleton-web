# `utils/` — Pure Helpers

Stateless, deterministic, framework-free functions. Frontend equivalent of the backend `utils/` contract — same rules, same discipline.

Peer to `slices/`, `ui/`, `services/`, `hooks/`, `providers/`, `constants/`.

## Contract

- **Pure** — same input, same output; no `Math.random()`, no `Date.now()` at module level, no I/O
- **No React** — no `useState`, `useEffect`, no JSX. Files end in `.ts`, never `.tsx`
- **No fetch/axios** — no network. That belongs in `services/`
- **No hooks** — no `use-*.ts` files here. Those belong in `hooks/` (cross-slice) or `slices/<X>/hooks/` (domain)
- **No grab-bag files** — `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `shared.ts` rejected by architecture test

## File naming

One concept per file, kebab-case by responsibility:

- `cn.ts` — classname merge (`clsx` + `tailwind-merge`)
- `format-date.ts` — date/time formatting helpers
- `platform.ts` — platform detection (OS, browser)

## When to add a file here

| Scope | Location |
|-------|----------|
| Pure function, used by 2+ slices | `utils/<name>.ts` (here) |
| React hook (stateful logic) | `hooks/use-<name>.ts` |
| External adapter (HTTP, browser API) | `services/<name>-service.ts` |
| Context provider (`.tsx`) | `providers/<name>-provider.tsx` |
| Visual primitive | `ui/<name>.tsx` |
| Domain-scoped helper | `slices/<name>/<responsibility>.ts` |

## Mental model

`utils/` is to frontend what `components/ui/` is to UI primitives: small, composable, framework-free pieces. Backend `utils/` and frontend `utils/` share the exact same contract — pure helpers, one concept per file.

## Anti-patterns

```ts
// ❌ Hook in utils/
// utils/use-bulk-delete.ts — goes in hooks/

// ❌ TSX in utils/
// utils/theme-provider.tsx — goes in providers/

// ❌ fetch in utils/
// utils/api-client.ts — goes in services/

// ❌ Grab-bag
// utils/utils.ts, utils/helpers.ts, utils/common.ts — rejected
```

See ADR 0012 (frontend-structure) in ai-first-architecture spec.
