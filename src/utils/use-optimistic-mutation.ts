import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** Options for the optimistic mutation hook. */
interface OptimisticMutationOptions<TData, TVariables> {
	/** TanStack Query key to optimistically update. */
	queryKey: QueryKey
	/** The async function that performs the actual mutation. */
	mutationFn: (variables: TVariables) => Promise<unknown>
	/** Produces the optimistic state from the current cache + mutation variables. */
	optimisticUpdate: (current: TData, variables: TVariables) => TData
	/** Toast message on success. Defaults to "Saved". */
	successMessage?: string
	/** Toast message on error. Defaults to the error message. */
	errorMessage?: string
}

/**
 * Generic optimistic mutation hook — wraps TanStack Query useMutation with
 * `onMutate` optimistic update + automatic rollback on error.
 *
 * Usage in slice hooks:
 * ```ts
 * const toggle = useOptimisticMutation({
 *   queryKey: ['todos'],
 *   mutationFn: (id: string) => api.patch(`/api/v1/todos/${id}`, { completed: true }),
 *   optimisticUpdate: (old, id) => ({
 *     ...old,
 *     data: old.data.map(t => t.id === id ? { ...t, completed: true } : t),
 *   }),
 * })
 * ```
 */
export function useOptimisticMutation<TData, TVariables>({
	queryKey,
	mutationFn,
	optimisticUpdate,
	successMessage = 'Saved',
	errorMessage,
}: OptimisticMutationOptions<TData, TVariables>) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn,
		onMutate: async (variables) => {
			// Cancel in-flight queries so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey })
			const previous = queryClient.getQueryData<TData>(queryKey)
			if (previous !== undefined) {
				queryClient.setQueryData<TData>(queryKey, (old) =>
					old !== undefined ? optimisticUpdate(old, variables) : old,
				)
			}
			return { previous }
		},
		onError: (_error, _variables, context) => {
			// Rollback to previous state
			if (context?.previous !== undefined) {
				queryClient.setQueryData(queryKey, context.previous)
			}
			const message =
				errorMessage ?? (_error instanceof Error ? _error.message : 'Operation failed')
			toast.error(message)
		},
		onSuccess: () => {
			toast.success(successMessage)
		},
		onSettled: () => {
			// Always refetch to ensure cache is in sync with server
			queryClient.invalidateQueries({ queryKey })
		},
	})
}
