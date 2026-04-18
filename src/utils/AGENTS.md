# utils/ — Pure Helpers

Pure functions. No React, no fetch, no side effects.

## Rules (arch test enforced)

- ❌ `.tsx` files
- ❌ `from 'react'` imports
- ❌ `fetch()` / `axios` / browser APIs
- ❌ Grab-bag: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `shared.ts`
- ✅ Name by responsibility: `cn.ts`, `format-date.ts`, `platform.ts`

## Example

```ts
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(iso))
}
```

Full contract: repo-root `AGENTS.md` section "Where to Put New Code".
