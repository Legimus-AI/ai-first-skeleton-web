import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { authQueryOptions, type CurrentUser } from '../../hooks/use-auth'
import { ChangeEmailCard } from '../change-email-card'

const user: CurrentUser = {
	id: '01a10a08-6d2c-7c18-9258-cf67ae98801f',
	organizationId: '01a10a08-6d1a-7666-8844-238460107859',
	email: 'ana@example.com',
	name: 'Ana',
	role: 'owner',
	emailVerified: false,
	emailVerifiedAt: null,
	createdAt: '2026-10-05T01:56:42.021Z',
	updatedAt: '2026-10-05T01:56:42.021Z',
	organizationName: 'Demo Org',
	isPlatformAdmin: false,
}

function renderCardFor(currentUser: CurrentUser) {
	const queryClient = new QueryClient()
	queryClient.setQueryData(authQueryOptions.queryKey, currentUser)
	render(
		<QueryClientProvider client={queryClient}>
			<ChangeEmailCard />
		</QueryClientProvider>,
	)
}

describe('ChangeEmailCard', () => {
	it('asks an unverified account to verify first, instead of showing the form the API refuses', () => {
		renderCardFor(user)
		expect(screen.getByText(/Verifica tu correo antes de cambiarlo/)).toBeTruthy()
		expect(screen.queryByLabelText('Email nuevo')).toBeNull()
	})

	it('shows the form to a verified account', () => {
		renderCardFor({ ...user, emailVerified: true })
		expect(screen.getByLabelText('Email nuevo')).toBeTruthy()
	})
})
