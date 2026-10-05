# Pagination

List URLs are untrusted input: `parseListParams` (`src/hooks/use-query-params.ts`) clamps `page` to an integer ≥ 1 and `limit` to `PER_PAGE_OPTIONS` (10, 15, 25, 50), so an old link like `?page=-1&limit=100000` loads page 1 with 50 rows. When a page stops existing (its last rows were deleted), `usePageInRange` moves the list to the last page; the empty state shows only when `total` is 0. Row selection (`useRowSelection`) empties when page, search, sort or limit change.

List hooks accept optional `ListQuery` params:

```typescript
import { useTodos } from '@/slices/todos/hooks/use-todos'

// Default: page 1, limit 20
const { data } = useTodos()

// With filters
const { data } = useTodos({ page: 2, search: 'buy', sort: 'createdAt', order: 'desc' })

// Access metadata
data?.meta.total      // total items
data?.meta.totalPages // total pages
data?.meta.hasMore    // more pages available
```
