# utils/ — Pure Helpers

Pure functions. No React, no fetch, no side effects, no module state: a helper whose setter changes what later calls return is a service (`services/date-format-service.ts`).

## Rules (arch test enforced)

- ❌ `.tsx` files
- ❌ `from 'react'` imports
- ❌ `fetch()` / `axios` / browser APIs
- ❌ Grab-bag: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `shared.ts`
- ✅ Name by responsibility: `cn.ts`, `non-empty-text.ts`, `platform.ts`

## Example

```ts
/** The value when it is a non-empty string, else undefined: how optional search params are read. */
export function nonEmptyText(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}
```

Full contract: repo-root `AGENTS.md` section "Where to Put New Code".
