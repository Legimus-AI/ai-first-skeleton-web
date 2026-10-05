import { useEffect } from 'react'

interface PageMeta {
	page: number
	total: number
	totalPages: number
}

/** The last page when `meta.page` is past it while results exist (e.g. its rows were deleted). */
export function lastPageIfPastEnd(meta: PageMeta | undefined): number | null {
	if (!meta || meta.total === 0 || meta.page <= meta.totalPages) return null
	return meta.totalPages
}

/**
 * Moves a list off a page that no longer exists, so "no results" only shows when there are none.
 * Returns true while it is moving, so the list can keep showing its skeleton.
 */
export function usePageInRange(
	meta: PageMeta | undefined,
	setPage: (page: number) => void,
): boolean {
	const lastPage = lastPageIfPastEnd(meta)
	useEffect(() => {
		if (lastPage !== null) setPage(lastPage)
	}, [lastPage, setPage])
	return lastPage !== null
}
