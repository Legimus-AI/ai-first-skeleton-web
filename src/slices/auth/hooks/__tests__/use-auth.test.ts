import { onlineManager, QueryClient, QueryObserver } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api-client'
import { authQueryOptions } from '../use-auth'

vi.mock('@/services/api-client', () => ({
	api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}))

const signedInUser = {
	id: '01a10a08-6d2c-7c18-9258-cf67ae98801f',
	organizationId: '01a10a08-6d1a-7666-8844-238460107859',
	email: 'demo@example.com',
	name: 'Demo User',
	role: 'owner',
	emailVerified: false,
	emailVerifiedAt: null,
	createdAt: '2026-10-05T01:56:42.021Z',
	updatedAt: '2026-10-05T01:56:42.021Z',
}

/** Runs the _authed guard's session check while a pending screen observes the query and unmounts. */
async function checkSessionWhilePendingScreenUnmounts() {
	let respond: (response: Response) => void = () => {}
	vi.mocked(api.get).mockReturnValue(
		new Promise<Response>((resolve) => {
			respond = resolve
		}),
	)
	const queryClient = new QueryClient()
	const guardCheck = queryClient.ensureQueryData({ ...authQueryOptions, revalidateIfStale: true })
	const pendingScreenObserver = new QueryObserver(queryClient, authQueryOptions)
	const unmountPendingScreen = pendingScreenObserver.subscribe(() => {})
	unmountPendingScreen()
	respond(Response.json({ data: signedInUser }))
	return guardCheck
}

describe('session check (auth/me)', () => {
	afterEach(() => onlineManager.setOnline(true))

	it('keeps the route guard alive when the pending screen unmounts mid-request', async () => {
		await expect(checkSessionWhilePendingScreenUnmounts()).resolves.toMatchObject({
			email: signedInUser.email,
		})
	})

	it('still asks the server when the browser reported offline earlier', async () => {
		onlineManager.setOnline(false)
		await expect(checkSessionWhilePendingScreenUnmounts()).resolves.toMatchObject({
			email: signedInUser.email,
		})
	})
})
