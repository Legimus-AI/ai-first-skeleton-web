import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'

// WHY: a redirect that wraps itself never settles; past this many navigations the app is stopped.
const NAVIGATION_LOOP_LIMIT = 5

const signedInUser = {
	id: '01a10a08-6d2c-7c18-9258-cf67ae98801f',
	organizationId: '01a10a08-6d1a-7666-8844-238460107859',
	email: 'demo@example.com',
	name: 'Demo User',
	role: 'owner' as const,
	emailVerified: true,
	emailVerifiedAt: '2026-10-05T01:56:42.021Z',
	createdAt: '2026-10-05T01:56:42.021Z',
	updatedAt: '2026-10-05T01:56:42.021Z',
}

afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
})

describe('a session that ends while a page is open', () => {
	it('goes to the login once, with that page as the way back', async () => {
		// Page data never arrives: only the session matters here.
		vi.stubGlobal('fetch', () => new Promise(() => {}))
		vi.stubGlobal('matchMedia', () => ({
			matches: false,
			addEventListener: () => {},
			removeEventListener: () => {},
		}))
		const queryClient = new QueryClient()
		queryClient.setQueryData(authQueryOptions.queryKey, signedInUser)
		const router = createRouter({
			routeTree,
			context: { queryClient },
			history: createMemoryHistory({ initialEntries: ['/chat'] }),
		})
		const app = render(
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>,
		)
		await waitFor(() => expect(router.state.resolvedLocation?.pathname).toBe('/chat'))

		const visitedHrefs: string[] = []
		router.history.subscribe(() => {
			visitedHrefs.push(router.history.location.href)
			if (visitedHrefs.length > NAVIGATION_LOOP_LIMIT) app.unmount()
		})
		act(() => queryClient.setQueryData(authQueryOptions.queryKey, null))

		await waitFor(() =>
			expect(
				visitedHrefs.length > NAVIGATION_LOOP_LIMIT ||
					router.state.resolvedLocation?.pathname === '/login',
			).toBe(true),
		)
		expect(visitedHrefs).toEqual(['/login?redirect=%2Fchat'])
	})
})
