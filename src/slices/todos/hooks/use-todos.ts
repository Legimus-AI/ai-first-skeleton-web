import {
	type CreateTodo,
	type ListQuery,
	todoListResponseSchema,
	todoResponseSchema,
	type UpdateTodo,
} from '@repo/shared'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { safeParseResponse, throwIfNotOk } from '@/lib/api-error'
import { useBulkDelete } from '@/lib/use-bulk-delete'

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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TODOS_KEY })
			toast.success('Todo created')
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create todo')
		},
	})
}

export function useUpdateTodo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, ...input }: UpdateTodo & { id: string }) => {
			const res = await api.patch(`/api/v1/todos/${id}`, input)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(todoResponseSchema, json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TODOS_KEY })
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update todo')
		},
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
			toast.success('Todo deleted')
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete todo')
		},
	})
}

export const useBulkDeleteTodos = () => useBulkDelete('/api/v1/todos', [...TODOS_KEY])
