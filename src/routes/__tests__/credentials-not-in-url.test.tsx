import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routeTree } from '@/routeTree.gen'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'

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

function renderAt(href: string, fetchMock: ReturnType<typeof vi.fn>) {
	vi.stubGlobal('fetch', fetchMock)
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
		history: createMemoryHistory({ initialEntries: [href] }),
	})
	render(
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	)
	return router
}

describe('the device page', () => {
	it('asks for the code instead of looking up the one in the link', async () => {
		const fetchMock = vi.fn(() => new Promise<Response>(() => {}))
		renderAt('/device?user_code=ABCD-EFGH', fetchMock)

		expect(await screen.findByLabelText('Código')).toHaveProperty('value', '')
		// Looking a code up while signed in claims it for the account, so nothing may go out.
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('the password reset page', () => {
	it('takes the token out of the URL and still sends it in the request body', async () => {
		const fetchMock = vi.fn(async () => Response.json({ status: true }))
		const router = renderAt('/reset-password?token=secret-token', fetchMock)

		await waitFor(() => expect(router.state.location.search).toEqual({}))
		expect(router.history.location.href).toBe('/reset-password')

		fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a-new-password' } })
		fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

		await waitFor(() => expect(fetchMock).toHaveBeenCalled())
		const [resetUrl, resetInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(new URL(resetUrl, 'http://localhost').pathname).toBe('/api/auth/reset-password')
		expect(new URL(resetUrl, 'http://localhost').search).toBe('')
		expect(JSON.parse(String(resetInit.body))).toEqual({
			token: 'secret-token',
			newPassword: 'a-new-password',
		})
	})
})
