// Backend-agnostic API client — works with any backend that follows the AI-First API contract.
// Types come from @repo/shared (Zod schemas), not from the backend framework.
import { ApiError } from '@/services/api-error'

declare global {
	interface Response {
		readonly requestId?: string
	}
}

// WHY: a hung API must end in an error the user can retry, never in an endless skeleton.
const REQUEST_TIMEOUT_MS = 15_000

type QueryParams = Record<string, string | number | undefined>

function buildUrl(path: string, params?: QueryParams): string {
	const url = new URL(path, globalThis.location.origin)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) url.searchParams.set(key, String(value))
		}
	}
	return url.toString()
}

async function request(path: string, options?: RequestInit): Promise<Response> {
	const { headers: customHeaders, body, signal, ...rest } = options ?? {}
	// WHY: one controller instead of AbortSignal.any, which Safari only has since 17.4.
	const controller = new AbortController()
	const timeout = setTimeout(
		() => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
		REQUEST_TIMEOUT_MS,
	)
	if (signal?.aborted) controller.abort(signal.reason)
	signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
	// WHY: a Headers instance (Better Auth's client sends one) does not spread into an object.
	const headers = new Headers(customHeaders)
	if (body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
	let res: Response
	try {
		res = await fetch(path, {
			credentials: 'include',
			...rest,
			signal: controller.signal,
			...(body != null && { body }),
			headers,
		})
	} catch (error) {
		// A caller's cancellation (e.g. TanStack Query unmounting) is not a failure.
		if (signal?.aborted) throw error
		throw new ApiError(`Network request failed: ${String(error)}`, 'INTERNAL_ERROR', {
			status: 0,
			path: new URL(path, globalThis.location.origin).pathname,
		})
	} finally {
		// WHY: the limit covers waiting for an answer; aborting later breaks the caller's body read.
		clearTimeout(timeout)
	}
	// Attach requestId for observability tools (Sentry breadcrumbs, OTEL spans, etc.)
	const requestId = res.headers.get('X-Request-Id')
	if (requestId) {
		Object.defineProperty(res, 'requestId', { value: requestId, enumerable: true })
	}
	return res
}

export const api = {
	/** Pass the TanStack Query `signal` so leaving a page cancels its requests. */
	get: (path: string, params?: QueryParams, signal?: AbortSignal) =>
		request(buildUrl(path, params), signal ? { signal } : undefined),

	post: (path: string, body: unknown) =>
		request(path, { method: 'POST', body: JSON.stringify(body) }),

	put: (path: string, body: unknown) =>
		request(path, { method: 'PUT', body: JSON.stringify(body) }),

	patch: (path: string, body: unknown) =>
		request(path, { method: 'PATCH', body: JSON.stringify(body) }),

	delete: (path: string, body?: unknown) =>
		request(path, {
			method: 'DELETE',
			...(body != null && { body: JSON.stringify(body) }),
		}),

	/** A request a client library already built (Better Auth's): same time limit and errors. */
	send: (url: string, init?: RequestInit) => request(url, init),
}
