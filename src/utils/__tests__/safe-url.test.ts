import { describe, expect, it } from 'vitest'
import { safeUrl } from '../safe-url'

describe('safeUrl', () => {
	it.each([
		'https://example.com/a?b=1',
		'http://example.com',
		'mailto:hola@example.com',
		'tel:+51983724476',
		'/settings/team',
		'relative/path',
	])('keeps %s', (link) => {
		expect(safeUrl(link)).toBe(link)
	})

	it.each([
		'javascript:alert(1)',
		' JavaScript:alert(1)',
		'java\tscript:alert(1)',
		'java\nscript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'vbscript:msgbox(1)',
		'',
		undefined,
		42,
	])('refuses %s', (link) => {
		expect(safeUrl(link)).toBeUndefined()
	})
})
