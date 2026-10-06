/**
 * Helpers for URL-persisted list parameters.
 *
 * Usage in route file:
 * ```ts
 * export const Route = createFileRoute('/_authed/products')({
 *   validateSearch: (s) => parseListParams(s),
 *   component: ProductsPage,
 * })
 * ```
 *
 * Usage in component:
 * ```ts
 * const params = useSearch({ from: '/_authed/products' })
 * const navigate = useNavigate()
 * navigate({ search: (prev) => ({ ...prev, search: 'matcha', page: 1 }), replace: true })
 * ```
 */

export interface ListParams {
	search: string
	page: number
	limit: number
	sort: string
	order: 'asc' | 'desc'
}

/** Rows-per-page choices offered by `Pagination`; a URL can only ask for one of these. */
export const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const

/** Default list params — use for Link/navigate to list routes. */
export const DEFAULT_LIST_PARAMS: ListParams = {
	search: '',
	page: 1,
	limit: 15,
	sort: 'updatedAt',
	order: 'desc',
}

/** The largest per-page option not above `limit` (an old or hand-edited link can ask for anything). */
function clampLimit(limit: number): number {
	return PER_PAGE_OPTIONS.filter((option) => option <= limit).at(-1) ?? PER_PAGE_OPTIONS[0]
}

/** Parse raw search params with defaults. Use in route `validateSearch`. */
export function parseListParams(
	raw: Record<string, unknown>,
	defaults?: Partial<ListParams>,
): ListParams {
	return {
		search: typeof raw.search === 'string' ? raw.search : (defaults?.search ?? ''),
		page:
			typeof raw.page === 'number' && Number.isFinite(raw.page)
				? Math.max(1, Math.floor(raw.page))
				: (defaults?.page ?? 1),
		limit:
			typeof raw.limit === 'number' && Number.isFinite(raw.limit)
				? clampLimit(raw.limit)
				: (defaults?.limit ?? 15),
		sort: typeof raw.sort === 'string' ? raw.sort : (defaults?.sort ?? 'updatedAt'),
		order: raw.order === 'asc' || raw.order === 'desc' ? raw.order : (defaults?.order ?? 'desc'),
	}
}
