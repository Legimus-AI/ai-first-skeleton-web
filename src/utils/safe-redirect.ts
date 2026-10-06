// Public auth pages are never a destination: wrapping one nests /login?redirect=/login?redirect=…
const AUTH_PAGES = new Set([
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/verify-email',
])

// WHY: any base works; what matters is whether the value keeps it or moves to another host.
const SAME_SITE_BASE = 'http://same-site.invalid'

/** `value` as a page on this site (e.g. "/todos?page=2") other than an auth page; otherwise undefined. */
export function safeRedirectPath(value: unknown): string | undefined {
	if (typeof value !== 'string' || !value.startsWith('/')) return undefined
	// The browser's own parsing decides: "//evil.com", "/\evil.com" and "/<tab>/evil.com" all
	// resolve to another host. The resolved path is returned, so the value checked is the one used.
	let resolved: URL
	try {
		resolved = new URL(value, SAME_SITE_BASE)
	} catch {
		return undefined // not a URL at all (e.g. "//[x")
	}
	if (resolved.origin !== SAME_SITE_BASE || AUTH_PAGES.has(resolved.pathname)) return undefined
	return resolved.pathname + resolved.search + resolved.hash
}
