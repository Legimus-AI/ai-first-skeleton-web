# hooks/ — Cross-Slice React Hooks

Generic hooks used by 2+ slices. No domain entities mentioned.

## Rules (arch test enforced)

- ❌ imports from `@/slices/*`
- ❌ Files not prefixed with `use-`
- ✅ May import from `@/services/` and `@/utils/`
- ✅ Black-box test: would this hook work in a different-domain app of the same stack?

## Example

```ts
import { useNavigate, useSearch } from '@tanstack/react-router'

export function useQueryParams<T extends Record<string, unknown>>() {
  const params = useSearch({ strict: false }) as T
  const navigate = useNavigate()
  const set = (patch: Partial<T>) =>
    navigate({ search: (s) => ({ ...s, ...patch }) as T })
  return [params, set] as const
}
```

Domain hook (mentions `product`, `assistant`, etc.) → `slices/<name>/hooks/` instead.
Full contract: repo-root `AGENTS.md`.
