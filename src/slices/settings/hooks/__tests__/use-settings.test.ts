import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api-client'
import {
	organizationSettingsQueryOptions,
	useOrganizationSettings,
	useUpdateOrganizationSettings,
	useUserSettings,
} from '../use-settings'

vi.mock('@/services/api-client', () => ({
	api: { get: vi.fn(), patch: vi.fn() },
}))

vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedGet = vi.mocked(api.get)
const mockedPatch = vi.mocked(api.patch)

function jsonResponse(status: number, body: unknown): Response {
	return { ok: status < 400, status, json: () => Promise.resolve(body) } as Response
}

function createWrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return createElement(QueryClientProvider, { client: queryClient }, children)
	}
}

function createQueryClient() {
	return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

describe('settings hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('reads the person settings from the { data } envelope', async () => {
		mockedGet.mockResolvedValue(jsonResponse(200, { data: { theme: 'dark', timeZone: null } }))

		const { result } = renderHook(() => useUserSettings(), {
			wrapper: createWrapper(createQueryClient()),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(result.current.data).toEqual({ theme: 'dark', timeZone: null })
		expect(mockedGet).toHaveBeenCalledWith(
			'/api/v1/me/settings',
			undefined,
			expect.any(AbortSignal),
		)
	})

	it('fails instead of showing defaults when the answer lacks the { data } envelope', async () => {
		mockedGet.mockResolvedValue(jsonResponse(200, { timeZone: 'Europe/Madrid', locale: 'es-ES' }))

		const { result } = renderHook(() => useOrganizationSettings(), {
			wrapper: createWrapper(createQueryClient()),
		})

		await waitFor(() => expect(result.current.isError).toBe(true))
	})

	it('sends a merge patch and keeps the saved settings in the cache', async () => {
		const saved = { timeZone: 'America/Lima', locale: 'en-US' }
		mockedPatch.mockResolvedValue(jsonResponse(200, { data: saved }))
		const queryClient = createQueryClient()

		const { result } = renderHook(() => useUpdateOrganizationSettings(), {
			wrapper: createWrapper(queryClient),
		})
		await act(() => result.current.mutateAsync({ timeZone: null, locale: 'en-US' }))

		expect(mockedPatch).toHaveBeenCalledWith('/api/v1/organization/settings', {
			timeZone: null,
			locale: 'en-US',
		})
		expect(queryClient.getQueryData(organizationSettingsQueryOptions.queryKey)).toEqual(saved)
	})
})
