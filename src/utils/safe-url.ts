// WHY: any base works; it only lets a relative link ("/todos") parse.
const SAME_SITE_BASE = 'http://same-site.invalid'
const LINKABLE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** `value` when it is safe to put in an `href`/`src` (a web, mail or phone link, or a relative one); else undefined. */
export function safeUrl(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined
	const url = value.trim()
	if (!url) return undefined
	try {
		// The browser's own parsing decides: it drops tabs and newlines, so "java\tscript:" is javascript:.
		return LINKABLE_SCHEMES.has(new URL(url, SAME_SITE_BASE).protocol) ? url : undefined
	} catch {
		return undefined
	}
}
