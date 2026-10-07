/** What Better Auth's `url` answers mean for the browser: read them, then follow them safely. */
import { nonEmptyText } from '@/utils/non-empty-text'

/** Where Better Auth sends the browser next (an OAuth resume, Google), when it says so. */
export interface AuthRedirect {
	url: string | undefined
}

/** The `url` in a Better Auth answer, when it carries one. */
export function redirectOf(response: unknown): AuthRedirect {
	const url =
		typeof response === 'object' && response !== null && 'url' in response
			? response.url
			: undefined
	return { url: nonEmptyText(url) }
}

/** Sends the browser where Better Auth points, unless the scheme would run code. */
export function followAuthRedirect(url: string): void {
	const scheme = new URL(url, globalThis.location.origin).protocol
	if (['javascript:', 'data:', 'vbscript:'].includes(scheme)) {
		throw new Error(`Refused to follow a ${scheme} redirect`)
	}
	globalThis.location.assign(url)
}
