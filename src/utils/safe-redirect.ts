// Public auth pages are never a destination: wrapping one nests /login?redirect=/login?redirect=…
const AUTH_PAGES = new Set([
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/verify-email',
])

/** `value` when it is a page on this site (e.g. "/todos?page=2") other than an auth page; otherwise undefined. */
export function safeRedirectPath(value: unknown): string | undefined {
	if (typeof value !== 'string' || !value.startsWith('/')) return undefined
	// "//evil.com" and "/\evil.com" are protocol-relative: browsers send them to another host.
	if (value.startsWith('//') || value.startsWith('/\\')) return undefined
	const [pathname = ''] = value.split(/[?#]/)
	if (AUTH_PAGES.has(pathname)) return undefined
	return value
}
