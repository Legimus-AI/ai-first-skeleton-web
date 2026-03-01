/**
 * Example test for TanStack Query hooks.
 *
 * Pattern: mock the api client, wrap in QueryClientProvider, assert on query results.
 * Copy this pattern for new slice hooks.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api-client'
import { useTodos } from '../use-todos'

// Mock the api client
vi.mock('@/lib/api-client', () => ({
	api: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}))

// Mock sonner to avoid DOM dependencies
vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedGet = vi.mocked(api.get)

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	})

	return function Wrapper({ children }: { children: ReactNode }) {
		return createElement(QueryClientProvider, { client: queryClient }, children)
	}
}

describe('useTodos', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('fetches todos and parses response through shared Zod schema', async () => {
		const mockResponse = {
			ok: true,
			json: () =>
				Promise.resolve({
					data: [
						{
							id: '550e8400-e29b-41d4-a716-446655440000',
							title: 'Buy milk',
							completed: false,
							createdAt: '2025-01-01T00:00:00.000Z',
							updatedAt: '2025-01-01T00:00:00.000Z',
						},
					],
					meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false },
				}),
		}
		mockedGet.mockResolvedValue(mockResponse as Response)

		const { result } = renderHook(() => useTodos(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data?.data).toHaveLength(1)
		expect(result.current.data?.data[0]?.title).toBe('Buy milk')
		expect(result.current.data?.meta.total).toBe(1)
		expect(mockedGet).toHaveBeenCalledWith('/api/todos', undefined)
	})

	it('passes query params to API client', async () => {
		const mockResponse = {
			ok: true,
			json: () =>
				Promise.resolve({
					data: [],
					meta: { page: 2, limit: 10, total: 0, totalPages: 0, hasMore: false },
				}),
		}
		mockedGet.mockResolvedValue(mockResponse as Response)

		const { result } = renderHook(() => useTodos({ page: 2, limit: 10 }), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(mockedGet).toHaveBeenCalledWith('/api/todos', { page: 2, limit: 10 })
	})

	it('handles API errors gracefully', async () => {
		const mockResponse = {
			ok: false,
			status: 500,
			json: () =>
				Promise.resolve({
					error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
				}),
		}
		mockedGet.mockResolvedValue(mockResponse as Response)

		const { result } = renderHook(() => useTodos(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true))

		expect(result.current.error).toBeDefined()
	})
})
