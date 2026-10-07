import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { router as appRouter } from '@/router'
import { routeTree } from '@/routeTree.gen'

const UNSAFE_REDIRECTS = [
	'https://evil.example',
	'//evil.example',
	'/\\evil.example',
	// The URL parser strips tabs and newlines, so each of these resolves to //evil.example.
	'/\t/evil.example',
	'/\n/evil.example',
	'/\r/evil.example',
	// Not a valid URL at all: dropped instead of breaking the login page.
	'//[evil.example',
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
	it.each(UNSAFE_REDIRECTS)('never sends a sign-in to %j', async (unsafeRedirect) => {
		expect((await loginSearchFor(unsafeRedirect)).redirect).toBeUndefined()
	})

	it('keeps a path on this site', async () => {
		expect((await loginSearchFor('/todos?page=2')).redirect).toBe('/todos?page=2')
	})
})

describe('login resuming an OAuth request', () => {
	it("hands the page Better Auth's signed query intact, repeated names included", async () => {
		const signed = new URLSearchParams([
			['response_type', 'code'],
			['client_id', 'claude-code'],
			['state', '1e5'],
			['ba_param', 'ba_param'],
			['ba_param', 'client_id'],
			['ba_param', 'response_type'],
			['ba_param', 'state'],
			['sig', 'c2ln'],
		]).toString()
		const router = createRouter({
			routeTree,
			context: { queryClient: new QueryClient() },
			parseSearch: appRouter.options.parseSearch,
			history: createMemoryHistory({ initialEntries: [`/login?${signed}`] }),
		})
		await router.load()
		const search = router.state.matches.at(-1)?.search as { oauth_query?: string }
		expect(search.oauth_query).toBe(signed)
	})
})
