import { useCallback, useMemo, useState } from 'react'

/**
 * Row selection for a paginated list. It empties whenever `resetKey` changes (page, search, sort,
 * limit), so a bulk action can never touch rows the user no longer sees.
 */
export function useRowSelection(resetKey: string) {
	const [selection, setSelection] = useState({
		resetKey,
		ids: new Set<string>(),
	})
	const selectedIds = useMemo(
		() => (selection.resetKey === resetKey ? selection.ids : new Set<string>()),
		[selection, resetKey],
	)
	const setSelectedIds = useCallback(
		(ids: Set<string>) => setSelection({ resetKey, ids }),
		[resetKey],
	)
	return [selectedIds, setSelectedIds] as const
}
