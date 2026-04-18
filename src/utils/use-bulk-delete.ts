import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/utils/api-client'
import { throwIfNotOk } from '@/utils/api-error'

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
		onSuccess: (_data, ids) => {
			queryClient.invalidateQueries({ queryKey: [...queryKey] })
			toast.success(`${ids.length} item${ids.length === 1 ? '' : 's'} deleted`, {
				description: 'The selected items have been permanently removed.',
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to delete items', {
				description: error.message,
			})
		},
	})
}
