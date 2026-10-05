import { isCancelledError, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/services/api-error'

// A 401 here means "not signed in" (auth/me) or "wrong password" (login), not "session lost".
const SESSION_EXEMPT_PATHS = new Set([
	'/api/v1/auth/me',
	'/api/v1/auth/login',
	'/api/v1/auth/register',
])

/** True when a request failed because the session is gone (expired, revoked, replaced). */
export function isSessionLost(error: unknown): boolean {
	return (
		error instanceof ApiError && error.status === 401 && !SESSION_EXEMPT_PATHS.has(error.path ?? '')
	)
}

/**
 * `.catch` for route loaders. Their fetch is cancelled when the page observing the same query is
 * hidden mid-load (a cached page shown while `beforeLoad` suspends); the page refetches on mount.
 */
export function ignoreCancelled(error: unknown): void {
	if (!isCancelledError(error)) throw error
}

/** Retry once, and only what a retry can fix: no response, or a 5xx. Never a 4xx. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
	if (failureCount >= 1 || !(error instanceof ApiError) || error.status === undefined) return false
	return error.status === 0 || error.status >= 500
}

/** The app's single QueryClient: every query and mutation shares one session and retry policy. */
export function createQueryClient(onSessionLost: () => void): QueryClient {
	const onError = (error: unknown) => {
		if (isSessionLost(error)) onSessionLost()
	}
	return new QueryClient({
		queryCache: new QueryCache({ onError }),
		mutationCache: new MutationCache({ onError }),
		defaultOptions: {
			queries: { retry: shouldRetry, staleTime: 5_000 },
		},
	})
}
