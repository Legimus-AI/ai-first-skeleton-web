import {
	type AuthResponse,
	authResponseSchema,
	type Login,
	type Register,
	type UpdateProfile,
	type User,
} from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { safeParseResponse, throwIfNotOk } from '@/lib/api-error'

export const authQueryOptions = queryOptions({
	queryKey: ['auth', 'me'],
	queryFn: async (): Promise<User | null> => {
		const res = await api.get('/api/v1/auth/me')
		if (res.status === 401) return null
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		const parsed: AuthResponse = safeParseResponse(authResponseSchema, json)
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
			const res = await api.post('/api/v1/auth/login', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(authResponseSchema, json)
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['auth', 'me'], data.data)
			navigate({ to: '/dashboard' })
		},
		onError: (error: Error) => {
			toast.error('Login failed', {
				description: error.message || 'Please check your credentials and try again.',
			})
		},
	})
}

// NOTE: Register creates a new organization for each user.
// For multi-user projects, implement an invite flow:
//   1. POST /api/v1/auth/invite — sends invite with org ID
//   2. GET /api/v1/auth/accept-invite/:token — joins existing org
// See: AGENTS.md "Multi-User" section for guidance.
export function useRegister() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async (input: Register) => {
			const res = await api.post('/api/v1/auth/register', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(authResponseSchema, json)
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['auth', 'me'], data.data)
			navigate({ to: '/dashboard' })
		},
		onError: (error: Error) => {
			toast.error('Registration failed', {
				description: error.message || 'Please try again.',
			})
		},
	})
}

export function useUpdateProfile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: UpdateProfile) => {
			const res = await api.patch('/api/v1/auth/me', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(authResponseSchema, json)
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['auth', 'me'], data.data)
			toast.success('Profile updated', {
				description: 'Your changes have been saved.',
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to update profile', {
				description: error.message || 'Please try again.',
			})
		},
	})
}

export function useLogout() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async () => {
			const res = await api.post('/api/v1/auth/logout', {})
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
