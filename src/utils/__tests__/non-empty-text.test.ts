import { describe, expect, it } from 'vitest'
import { nonEmptyText } from '@/utils/non-empty-text'

describe('nonEmptyText', () => {
	it('keeps a non-empty string as is', () => {
		expect(nonEmptyText('ba_param=client_id&sig=abc')).toBe('ba_param=client_id&sig=abc')
	})

	it('drops an empty string and every value that is not a string', () => {
		for (const value of ['', undefined, null, 0, 42, true, ['token'], { token: 'x' }]) {
			expect(nonEmptyText(value)).toBeUndefined()
		}
	})
})
