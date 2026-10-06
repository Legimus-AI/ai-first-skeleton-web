import { describe, expect, it } from 'vitest'
import { lastPageIfPastEnd } from '@/hooks/use-page-in-range'
import { parseListParams } from '@/hooks/use-query-params'

describe('parseListParams', () => {
	it('clamps page to an integer of at least 1', () => {
		expect(parseListParams({ page: -1 }).page).toBe(1)
		expect(parseListParams({ page: 0 }).page).toBe(1)
		expect(parseListParams({ page: 2.7 }).page).toBe(2)
		expect(parseListParams({ page: 'abc' }).page).toBe(1)
	})

	it('clamps limit to the per-page options', () => {
		expect(parseListParams({ limit: 100000 }).limit).toBe(50)
		expect(parseListParams({ limit: 20 }).limit).toBe(15)
		expect(parseListParams({ limit: 0 }).limit).toBe(10)
		expect(parseListParams({ limit: 25 }).limit).toBe(25)
	})
})

describe('lastPageIfPastEnd', () => {
	it('sends a list past its end back to the last page when results exist', () => {
		// The last rows of page 2 were deleted: 15 todos left, all on page 1.
		expect(lastPageIfPastEnd({ page: 2, total: 15, totalPages: 1 })).toBe(1)
	})

	it('leaves the page alone when it exists or when there are no results', () => {
		expect(lastPageIfPastEnd({ page: 1, total: 15, totalPages: 1 })).toBeNull()
		expect(lastPageIfPastEnd({ page: 3, total: 0, totalPages: 0 })).toBeNull()
		expect(lastPageIfPastEnd(undefined)).toBeNull()
	})
})
