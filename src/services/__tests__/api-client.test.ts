import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api-client'

const REQUEST_TIMEOUT_MS = 15_000

describe('request time limit', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it('ends a request that never answers with ApiError status 0', async () => {
		vi.stubGlobal(
			'fetch',
			(_url: string, init: RequestInit) =>
				new Promise((_resolve, reject) => {
					init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
				}),
		)
		const hungRequest = expect(api.get('/api/v1/todos')).rejects.toMatchObject({
			name: 'ApiError',
			status: 0,
		})
		await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
		await hungRequest
	})

	it('stops counting once the response arrives, so a slow body is never aborted', async () => {
		let requestSignal: AbortSignal | null | undefined
		vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
			requestSignal = init.signal
			return Response.json({ data: [] })
		})
		await api.get('/api/v1/todos')
		await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
		expect(requestSignal?.aborted).toBe(false)
	})
})
