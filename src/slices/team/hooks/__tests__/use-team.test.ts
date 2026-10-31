import type { User } from '@repo/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'
import {
	cancelInvitation,
	inviteMember,
	leaveOrganization,
	membershipIdOf,
	removeMember,
	updateMemberRole,
} from '@/slices/auth/auth-client'
import { AuthApiError } from '@/slices/auth/auth-error'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import {
	useBulkRemoveMembers,
	useLeaveOrganization,
	useResendInvitation,
	useUpdateMemberRole,
} from '../use-team'

const navigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))

vi.mock(import('@/slices/auth/auth-client'), async (importOriginal) => ({
	...(await importOriginal()),
	removeMember: vi.fn(),
	inviteMember: vi.fn(),
	cancelInvitation: vi.fn(),
	leaveOrganization: vi.fn(),
	updateMemberRole: vi.fn(),
	membershipIdOf: vi.fn(),
}))

vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}))

const signedInUser: User = {
	id: '01a10a08-6d2c-7c18-9258-cf67ae98801f',
	organizationId: '01a10a08-6d1a-7666-8844-238460107859',
	email: 'owner@example.com',
	name: 'Owner',
	role: 'owner',
	emailVerified: true,
	emailVerifiedAt: '2026-10-05T01:56:42.021Z',
	createdAt: '2026-10-05T01:56:42.021Z',
	updatedAt: '2026-10-05T01:56:42.021Z',
}

/** The hook, with the signed-in user cached: it names the organization every team call needs. */
function renderWithSignedInUser<Result>(useHook: () => Result) {
	const queryClient = new QueryClient()
	queryClient.setQueryData(authQueryOptions.queryKey, signedInUser)
	const wrapper = ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: queryClient }, children)
	return renderHook(useHook, { wrapper }).result
}

function renderBulkRemove() {
	return renderWithSignedInUser(() => useBulkRemoveMembers())
}

describe('useBulkRemoveMembers', () => {
	it('removes each member it can and says how many it could not', async () => {
		vi.mocked(removeMember).mockImplementation(async ({ email }) => {
			if (email === 'last-admin@example.com') {
				throw new AuthApiError('Cannot remove', 'YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER', {
					status: 403,
				})
			}
		})
		const bulkRemove = renderBulkRemove()

		await act(() =>
			expect(
				bulkRemove.current.mutateAsync([
					'ana@example.com',
					'last-admin@example.com',
					'luis@example.com',
				]),
			).rejects.toThrow('No se pudo quitar a 1 de 3 miembros'),
		)

		expect(removeMember).toHaveBeenCalledTimes(3)
		expect(toast.error).toHaveBeenCalledWith('No se pudo quitar a 1 de 3 miembros', {
			description: 'No tienes permiso para hacer esto.',
		})
	})
})

describe('team writes that need the organization', () => {
	it('resends a pending invitation to the same email and role, flagged as a resend', async () => {
		const resend = renderWithSignedInUser(() => useResendInvitation())

		await act(() =>
			resend.current.mutateAsync({
				id: '01a10a08-6d2c-7c18-9258-cf67ae98801a',
				email: 'ana@example.com',
				role: 'admin',
				expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
				createdAt: '2026-10-05T00:00:00.000Z',
			}),
		)

		expect(cancelInvitation).not.toHaveBeenCalled()
		expect(inviteMember).toHaveBeenCalledWith({
			email: 'ana@example.com',
			role: 'admin',
			organizationId: signedInUser.organizationId,
			resend: true,
		})
	})

	it('replaces an expired invitation with a new one instead of resending it', async () => {
		vi.mocked(inviteMember).mockClear()
		const resend = renderWithSignedInUser(() => useResendInvitation())

		await act(() =>
			resend.current.mutateAsync({
				id: '01a10a08-6d2c-7c18-9258-cf67ae98801a',
				email: 'ana@example.com',
				role: 'admin',
				expiresAt: '2026-10-06T00:00:00.000Z',
				createdAt: '2026-10-05T00:00:00.000Z',
			}),
		)

		expect(cancelInvitation).toHaveBeenCalledWith('01a10a08-6d2c-7c18-9258-cf67ae98801a')
		expect(inviteMember).toHaveBeenCalledWith({
			email: 'ana@example.com',
			role: 'admin',
			organizationId: signedInUser.organizationId,
			resend: false,
		})
	})

	it('sends the person to the login after leaving, because the leave ends their sessions', async () => {
		const leave = renderWithSignedInUser(() => useLeaveOrganization())

		await act(() => leave.current.mutateAsync())

		expect(leaveOrganization).toHaveBeenCalledWith(signedInUser.organizationId)
		expect(navigate).toHaveBeenCalledWith({ to: '/login', search: { redirect: undefined } })
	})

	it('hands ownership over through the membership id', async () => {
		vi.mocked(membershipIdOf).mockResolvedValue('membership-1')
		const updateRole = renderWithSignedInUser(() => useUpdateMemberRole())

		await act(() =>
			updateRole.current.mutateAsync({
				member: {
					id: '01a10a08-6d2c-7c18-9258-cf67ae98801b',
					email: 'luis@example.com',
					name: 'Luis',
					role: 'admin',
					emailVerified: true,
					createdAt: '2026-10-05T00:00:00.000Z',
				},
				role: 'owner',
			}),
		)

		expect(updateMemberRole).toHaveBeenCalledWith({
			memberId: 'membership-1',
			role: 'owner',
			organizationId: signedInUser.organizationId,
		})
	})
})
