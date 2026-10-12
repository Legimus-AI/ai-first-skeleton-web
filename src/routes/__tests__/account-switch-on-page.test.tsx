import type { OrganizationSettings, User, UserSettings } from '@repo/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import {
	organizationSettingsQueryOptions,
	userSettingsQueryOptions,
} from '@/slices/settings/hooks/use-settings'

const firstAccount: User = {
	id: '01a10a08-6d2c-7c18-9258-cf67ae98801f',
	organizationId: '01a10a08-6d1a-7666-8844-238460107859',
	email: 'demo@example.com',
	name: 'Demo User',
	role: 'owner',
	emailVerified: true,
	emailVerifiedAt: '2026-10-05T01:56:42.021Z',
	createdAt: '2026-10-05T01:56:42.021Z',
	updatedAt: '2026-10-05T01:56:42.021Z',
}
const secondAccount: User = {
	...firstAccount,
	id: '01a10a08-7e3d-7c18-9258-cf67ae98802a',
	email: 'other@example.com',
}
const secondAccountSettings: UserSettings = { theme: 'light', timeZone: null }
const organizationSettings: OrganizationSettings = { timeZone: 'America/Lima', locale: 'es-PE' }

/** The API as the second account sees it; other page data never arrives. */
function apiAfterTheSwitch(input: RequestInfo | URL, _init?: RequestInit): Promise<Response> {
	const { pathname } = new URL(String(input), 'http://localhost')
	const responseBodyByPath: Record<string, unknown> = {
		'/api/v1/auth/me': { data: secondAccount },
		'/api/v1/me/settings': { data: secondAccountSettings },
		'/api/v1/organization/settings': { data: organizationSettings },
	}
	if (!(pathname in responseBodyByPath)) return new Promise(() => {})
	return Promise.resolve(Response.json(responseBodyByPath[pathname]))
}

afterEach(() => {
	cleanup()
	localStorage.clear()
	document.documentElement.classList.remove('dark')
	vi.unstubAllGlobals()
})

describe('another account signs in from another tab', () => {
	it("drops the first account's data and shows the second account's theme", async () => {
		const fetchSpy = vi.fn(apiAfterTheSwitch)
		vi.stubGlobal('fetch', fetchSpy)
		vi.stubGlobal('matchMedia', () => ({
			matches: false,
			addEventListener: () => {},
			removeEventListener: () => {},
		}))
		const queryClient = new QueryClient()
		queryClient.setQueryData(authQueryOptions.queryKey, firstAccount)
		queryClient.setQueryData(userSettingsQueryOptions.queryKey, { theme: 'dark', timeZone: null })
		queryClient.setQueryData(organizationSettingsQueryOptions.queryKey, organizationSettings)
		const router = createRouter({
			routeTree,
			context: { queryClient },
			history: createMemoryHistory({ initialEntries: ['/chat'] }),
		})
		render(
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>,
		)
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))

		// The focus re-check of /me answers with the account the other tab signed in.
		act(() => queryClient.setQueryData(authQueryOptions.queryKey, secondAccount))

		await waitFor(() =>
			expect(queryClient.getQueryData(userSettingsQueryOptions.queryKey)).toEqual(
				secondAccountSettings,
			),
		)
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false))
		const patchCalls = fetchSpy.mock.calls.filter(([, init]) => init?.method === 'PATCH')
		expect(patchCalls).toEqual([])
	})
})
