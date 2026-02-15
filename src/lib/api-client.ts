// Backend-agnostic API client — works with any backend that follows the AI-First API contract.
// Types come from @repo/shared (Zod schemas), not from the backend framework.

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
	const url = new URL(path, globalThis.location.origin)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) url.searchParams.set(key, String(value))
		}
	}
	return url.toString()
}

async function request(path: string, options?: RequestInit): Promise<Response> {
	return fetch(path, {
		headers: { 'Content-Type': 'application/json', ...options?.headers },
		...options,
	})
}

export const api = {
	get: (path: string, params?: Record<string, string | number | undefined>) =>
		fetch(buildUrl(path, params)),

	post: (path: string, body: unknown) =>
		request(path, { method: 'POST', body: JSON.stringify(body) }),

	patch: (path: string, body: unknown) =>
		request(path, { method: 'PATCH', body: JSON.stringify(body) }),

	delete: (path: string) => request(path, { method: 'DELETE' }),
}
