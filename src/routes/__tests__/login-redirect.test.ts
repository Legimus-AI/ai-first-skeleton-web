import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { routeTree } from '@/routeTree.gen'

const UNSAFE_REDIRECTS = [
	'https://evil.example',
	'//evil.example',
	'/\\evil.example',
	// The login (or another auth page) as the destination nests the redirect on every pass.
	'/login?redirect=%2Ftodos',
	'/register',
]

/** The search the login page reads for `/login?redirect=<value>`, after the router validates it. */
async function loginSearchFor(redirect: string) {
	const router = createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		history: createMemoryHistory({
			initialEntries: [`/login?redirect=${encodeURIComponent(redirect)}`],
		}),
	})
	await router.load()
	return router.state.matches.at(-1)?.search as { redirect?: string }
}

describe('login redirect', () => {
	it.each(UNSAFE_REDIRECTS)('never sends a sign-in to %s', async (unsafeRedirect) => {
		expect((await loginSearchFor(unsafeRedirect)).redirect).toBeUndefined()
	})

	it('keeps a path on this site', async () => {
		expect((await loginSearchFor('/todos?page=2')).redirect).toBe('/todos?page=2')
	})
})
