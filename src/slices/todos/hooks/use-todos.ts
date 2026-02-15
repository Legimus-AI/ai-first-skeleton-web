import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'
import {
	type CreateTodo,
	type ListQuery,
	type UpdateTodo,
	todoListResponseSchema,
	todoResponseSchema,
} from '@repo/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const TODOS_KEY = ['todos'] as const

export function useTodos(params?: Partial<ListQuery>) {
	return useQuery({
		queryKey: [...TODOS_KEY, params],
		queryFn: async () => {
			const res = await api.api.todos.$get({ query: params ?? {} })
			await throwIfNotOk(res)
			const json = await res.json()
			return todoListResponseSchema.parse(json)
		},
	})
}

export function useCreateTodo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateTodo) => {
			const res = await api.api.todos.$post({ json: input })
			await throwIfNotOk(res)
			const json = await res.json()
			return todoResponseSchema.parse(json)
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
			const res = await api.api.todos[':id'].$patch({
				param: { id },
				json: input,
			})
			await throwIfNotOk(res)
			const json = await res.json()
			return todoResponseSchema.parse(json)
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
			const res = await api.api.todos[':id'].$delete({ param: { id } })
			await throwIfNotOk(res)
			const json = await res.json()
			return todoResponseSchema.parse(json)
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
