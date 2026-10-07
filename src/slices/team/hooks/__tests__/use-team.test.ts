import type { User } from '@repo/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'
import { removeMember } from '@/slices/auth/auth-client'
import { AuthApiError } from '@/slices/auth/auth-error'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import { useBulkRemoveMembers } from '../use-team'

vi.mock(import('@/slices/auth/auth-client'), async (importOriginal) => ({
	...(await importOriginal()),
	removeMember: vi.fn(),
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
function renderBulkRemove() {
	const queryClient = new QueryClient()
	queryClient.setQueryData(authQueryOptions.queryKey, signedInUser)
	const wrapper = ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: queryClient }, children)
	return renderHook(() => useBulkRemoveMembers(), { wrapper }).result
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
