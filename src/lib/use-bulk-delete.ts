import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'

/** Generic bulk delete hook — reusable across ALL slices.
 *
 * Usage in slice hooks:
 * ```ts
 * export const useBulkDeleteTodos = () => useBulkDelete('/api/v1/todos', ['todos'])
 * ```
 */
export function useBulkDelete(endpoint: string, queryKey: readonly string[]) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (ids: string[]) => {
			const res = await api.delete(`${endpoint}/bulk`, { ids })
			await throwIfNotOk(res)
			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [...queryKey] })
			toast.success('Items deleted')
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete items')
		},
	})
}
