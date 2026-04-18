# constants/ — Cross-Cutting Constants

Typed constants shared by 2+ slices. No I/O, no functions.

## Rules (arch test enforced)

- ❌ Function definitions (functions → `utils/`)
- ❌ imports from `@/slices/*`, `@/services/*`, `@/hooks/*`
- ❌ Grab-bag: `misc.ts`, `common.ts`, `shared.ts`, `helpers.ts`, `utils.ts`
- ✅ Name by domain: `routes.ts`, `limits.ts`, `pagination.ts`
- ✅ Use `as const`, `Readonly<>`, enums

## Example

```ts
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const PAGE_SIZES = [10, 20, 50, 100] as const
```

Full contract: repo-root `AGENTS.md`.
