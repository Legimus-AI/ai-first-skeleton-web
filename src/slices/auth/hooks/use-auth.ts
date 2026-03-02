import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'
import {
	type AuthResponse,
	type Login,
	type Register,
	type User,
	authResponseSchema,
} from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const authQueryOptions = queryOptions({
	queryKey: ['auth', 'me'],
	queryFn: async (): Promise<User | null> => {
		const res = await api.get('/api/auth/me')
		if (res.status === 401) return null
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		const parsed: AuthResponse = authResponseSchema.parse(json)
		return parsed.data
	},
	retry: false,
	staleTime: Number.POSITIVE_INFINITY, // Only refetch on explicit invalidation (login/logout)
})

export function useCurrentUser() {
	return useQuery(authQueryOptions)
}

export function useLogin() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async (input: Login) => {
			const res = await api.post('/api/auth/login', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return authResponseSchema.parse(json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
			navigate({ to: '/' })
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Login failed')
		},
	})
}

export function useRegister() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async (input: Register) => {
			const res = await api.post('/api/auth/register', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return authResponseSchema.parse(json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
			navigate({ to: '/' })
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Registration failed')
		},
	})
}

export function useLogout() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async () => {
			const res = await api.post('/api/auth/logout', {})
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			queryClient.clear()
			toast.success('Logged out successfully')
			navigate({ to: '/login' })
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Logout failed')
		},
	})
}
