import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { unsubscribeFromPush } from '@/hooks/use-push-notifications'
import { deleteAccount } from '../../auth-client'
import { useDeleteAccount } from '../use-account'

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/hooks/use-push-notifications', () => ({ unsubscribeFromPush: vi.fn() }))
vi.mock(import('../../auth-client'), async (importOriginal) => ({
	...(await importOriginal()),
	deleteAccount: vi.fn(),
}))

describe('useDeleteAccount', () => {
	it('drops the push subscription while the session still exists, then deletes the account', async () => {
		const callOrder: string[] = []
		vi.mocked(unsubscribeFromPush).mockImplementation(async () => {
			callOrder.push('unsubscribe')
		})
		vi.mocked(deleteAccount).mockImplementation(async () => {
			callOrder.push('delete')
		})
		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(QueryClientProvider, { client: new QueryClient() }, children)
		const { result } = renderHook(() => useDeleteAccount(), { wrapper })

		await act(() => result.current.mutateAsync('my-password'))

		expect(callOrder).toEqual(['unsubscribe', 'delete'])
		expect(deleteAccount).toHaveBeenCalledWith('my-password')
	})
})
