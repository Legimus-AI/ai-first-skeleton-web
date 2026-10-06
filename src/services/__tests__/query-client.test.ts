import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api-error'
import {
	createQueryClient,
	ignoreCancelled,
	isSessionLost,
	shouldRetry,
} from '@/services/query-client'

const unauthorized = (path: string) =>
	new ApiError('Authentication required', 'UNAUTHORIZED', {
		status: 401,
		path,
	})

describe('session policy (401)', () => {
	it('treats a 401 on a data route as a lost session', () => {
		expect(isSessionLost(unauthorized('/api/v1/todos'))).toBe(true)
	})

	it('ignores the 401s that mean "not signed in" or "wrong password"', () => {
		expect(isSessionLost(unauthorized('/api/v1/auth/me'))).toBe(false)
		expect(isSessionLost(unauthorized('/api/v1/auth/login'))).toBe(false)
		expect(isSessionLost(unauthorized('/api/v1/auth/register'))).toBe(false)
	})

	it('ignores other failures', () => {
		expect(
			isSessionLost(
				new ApiError('Forbidden', 'FORBIDDEN', {
					status: 403,
					path: '/api/v1/team',
				}),
			),
		).toBe(false)
		expect(isSessionLost(new Error('boom'))).toBe(false)
	})

	it('fires once from the query cache and from the mutation cache, never per hook', async () => {
		const onSessionLost = vi.fn()
		const queryClient = createQueryClient(onSessionLost)

		await queryClient
			.fetchQuery({
				queryKey: ['todos'],
				queryFn: () => Promise.reject(unauthorized('/api/v1/todos')),
				retry: false,
			})
			.catch(() => undefined)
		expect(onSessionLost).toHaveBeenCalledTimes(1)

		const mutation = queryClient.getMutationCache().build(queryClient, {
			mutationFn: () => Promise.reject(unauthorized('/api/v1/todos')),
		})
		await mutation.execute(undefined).catch(() => undefined)
		expect(onSessionLost).toHaveBeenCalledTimes(2)
	})

	it('does not fire for a wrong password on login', async () => {
		const onSessionLost = vi.fn()
		const queryClient = createQueryClient(onSessionLost)
		const mutation = queryClient.getMutationCache().build(queryClient, {
			mutationFn: () => Promise.reject(unauthorized('/api/v1/auth/login')),
		})
		await mutation.execute(undefined).catch(() => undefined)
		expect(onSessionLost).not.toHaveBeenCalled()
	})
})

describe('retry policy', () => {
	it('retries a network failure or a 5xx once', () => {
		expect(shouldRetry(0, new ApiError('offline', 'INTERNAL_ERROR', { status: 0 }))).toBe(true)
		expect(shouldRetry(0, new ApiError('down', 'INTERNAL_ERROR', { status: 503 }))).toBe(true)
		expect(shouldRetry(1, new ApiError('down', 'INTERNAL_ERROR', { status: 503 }))).toBe(false)
	})

	it('never retries a 4xx or a client-side error', () => {
		for (const status of [400, 401, 403, 404, 409, 429]) {
			expect(shouldRetry(0, new ApiError('no', 'VALIDATION_ERROR', { status }))).toBe(false)
		}
		expect(shouldRetry(0, new ApiError('schema mismatch', 'INTERNAL_ERROR'))).toBe(false)
		expect(shouldRetry(0, new TypeError('bug'))).toBe(false)
	})
})

describe('loader prefetch', () => {
	it('lets a cancelled prefetch go and rethrows any other failure', async () => {
		const queryClient = createQueryClient(() => {})
		const prefetch = queryClient.fetchQuery({
			queryKey: ['todos'],
			queryFn: () => new Promise(() => {}),
		})
		await queryClient.cancelQueries({ queryKey: ['todos'] })
		await expect(prefetch.catch(ignoreCancelled)).resolves.toBeUndefined()

		const serverDown = new ApiError('down', 'INTERNAL_ERROR', { status: 503 })
		expect(() => ignoreCancelled(serverDown)).toThrow(serverDown)
	})
})
