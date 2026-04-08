---
description: Enforces TanStack Query hook patterns when editing slice hooks
paths: ["**/src/slices/*/hooks/use-*.ts"]
context: inline
---

# Slice Hook Rules (auto-activated)

You are editing a TanStack Query hook. These rules are NON-NEGOTIABLE:

1. **All server state via TanStack Query** — no `useState` for API data
2. **Import types from `@repo/shared`** — never redefine response types
3. **Validate responses with `safeParseResponse()`** — catch schema drift at runtime
4. **Use `useOptimisticMutation`** for instant feedback on toggles/inline edits
5. **Query keys must be descriptive** — `['todos', 'list', params]` not `['data']`
6. **Mutations invalidate related queries** — `queryClient.invalidateQueries({ queryKey: ['todos'] })`
7. **No `useEffect` for data fetching** — the hook itself IS the data fetcher
8. **`keepPreviousData: true`** for list queries — prevents flash during pagination
