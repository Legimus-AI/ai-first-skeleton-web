import {
	type CreateTodo,
	type ListQuery,
	type Todo,
	type TodoListResponse,
	todoListResponseSchema,
	todoResponseSchema,
	type UpdateTodo,
} from '@repo/shared'
import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useBulkDelete } from '@/hooks/use-bulk-delete'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

export const TODOS_KEY = ['todos'] as const

export const todosQueryOptions = (params?: Partial<ListQuery>) =>
	queryOptions({
		queryKey: [...TODOS_KEY, params],
		queryFn: async ({ signal }) => {
			const res = await api.get('/api/v1/todos', params, signal)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoListResponseSchema, json)
		},
		placeholderData: keepPreviousData,
	})

export function useTodos(params?: Partial<ListQuery>) {
	return useQuery(todosQueryOptions(params))
}

/** How many todos are completed: a one-row page filtered by `completed`, read from `meta.total`. */
export const completedTodosCountQueryOptions = queryOptions({
	queryKey: [...TODOS_KEY, 'completed-count'],
	queryFn: async ({ signal }) => {
		const res = await api.get('/api/v1/todos', { completed: 'true', limit: 1 }, signal)
		await throwIfNotOk(res)
		const json = await res.json()
		return safeParseResponse(todoListResponseSchema, json).meta.total
	},
})

export function useCompletedTodosCount() {
	return useQuery(completedTodosCountQueryOptions)
}

export function useCreateTodo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateTodo) => {
			const res = await api.post('/api/v1/todos', input)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoResponseSchema, json)
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: TODOS_KEY })
			toast.success('Tarea creada', {
				description: `Agregamos "${variables.title}".`,
			})
		},
		onError: (error) => {
			toast.error('No se pudo crear la tarea', {
				description: toUserMessage(error),
			})
		},
	})
}

export function useUpdateTodo(params?: Partial<ListQuery>) {
	const queryKey = [...TODOS_KEY, params]

	return useOptimisticMutation<TodoListResponse, UpdateTodo & { id: string }>({
		queryKey,
		mutationFn: async ({ id, ...input }) => {
			const res = await api.patch(`/api/v1/todos/${id}`, input)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoResponseSchema, json)
		},
		optimisticUpdate: (old, { id, ...input }) => ({
			...old,
			data: old.data.map((t) =>
				t.id === id
					? ({
							...t,
							...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
						} as Todo)
					: t,
			),
		}),
		successMessage: 'Tarea actualizada',
	})
}

export function useDeleteTodo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.delete(`/api/v1/todos/${id}`)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoResponseSchema, json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TODOS_KEY })
			toast.success('Tarea eliminada')
		},
		onError: (error) => {
			toast.error('No se pudo eliminar la tarea', {
				description: toUserMessage(error),
			})
		},
	})
}

export const useBulkDeleteTodos = () => useBulkDelete('/api/v1/todos', [...TODOS_KEY])
