import {
	type CreateTodo,
	type ListQuery,
	type Todo,
	type TodoListResponse,
	todoListResponseSchema,
	todoResponseSchema,
	type UpdateTodo,
} from '@repo/shared'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { safeParseResponse, throwIfNotOk } from '@/lib/api-error'
import { useBulkDelete } from '@/lib/use-bulk-delete'
import { useOptimisticMutation } from '@/lib/use-optimistic-mutation'

const TODOS_KEY = ['todos'] as const

export function useTodos(params?: Partial<ListQuery>) {
	return useQuery({
		queryKey: [...TODOS_KEY, params],
		queryFn: async () => {
			const res = await api.get('/api/v1/todos', params)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoListResponseSchema, json)
		},
		placeholderData: keepPreviousData,
	})
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
			toast.success('Todo created', {
				description: `"${variables.title}" has been added.`,
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to create todo', {
				description: error.message,
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
		successMessage: 'Todo updated',
	})
}

export function useDeleteTodo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.delete(`/api/v1/todos/${id}`)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TODOS_KEY })
			toast.success('Todo deleted', {
				description: 'The item has been permanently removed.',
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to delete todo', {
				description: error.message,
			})
		},
	})
}

export const useBulkDeleteTodos = () => useBulkDelete('/api/v1/todos', [...TODOS_KEY])
