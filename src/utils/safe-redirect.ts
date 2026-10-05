/** `value` when it is a path on this site (e.g. "/todos?page=2"); otherwise undefined. */
export function safeRedirectPath(value: unknown): string | undefined {
	if (typeof value !== 'string' || !value.startsWith('/')) return undefined
	// "//evil.com" and "/\evil.com" are protocol-relative: browsers send them to another host.
	if (value.startsWith('//') || value.startsWith('/\\')) return undefined
	return value
}
