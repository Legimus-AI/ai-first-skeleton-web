import {
	type AuthResponse,
	authResponseSchema,
	type ForgotPasswordInput,
	type Login,
	type Register,
	type ResetPasswordInput,
	type UpdateProfile,
	type User,
	type VerifyEmailInput,
} from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { ApiError, safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

// WHY: the session can end server-side at any moment (logout in another tab, revocation, another
// localhost app replacing the cookie), so the cached user must be re-checked, not trusted forever.
const AUTH_STALE_TIME_MS = 60_000

export const authQueryOptions = queryOptions({
	queryKey: ['auth', 'me'],
	// WHY: the _authed beforeLoad awaits this same fetch. With a `signal` (or a fetch paused offline),
	// a pending screen that unmounts mid-request cancels it and the guard fails with CancelledError.
	queryFn: async (): Promise<User | null> => {
		const res = await api.get('/api/v1/auth/me')
		if (res.status === 401) return null
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		const parsed: AuthResponse = safeParseResponse(authResponseSchema, json)
		return parsed.data
	},
	retry: false,
	networkMode: 'always',
	staleTime: AUTH_STALE_TIME_MS,
	refetchOnWindowFocus: true,
})

export function useCurrentUser() {
	return useQuery(authQueryOptions)
}

/** Signs in, then goes to `redirectTo` (the page that asked for a login). */
export function useLogin(redirectTo: string) {
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
			// Data cached under a previous account must never show under this one.
			queryClient.clear()
			queryClient.setQueryData(authQueryOptions.queryKey, data.data)
			void navigate({ href: redirectTo })
		},
		onError: (error) => {
			toast.error('No pudimos iniciar sesión', {
				description:
					error instanceof ApiError && error.status === 401
						? 'Email o contraseña incorrectos.'
						: toUserMessage(error),
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
			queryClient.clear()
			queryClient.setQueryData(authQueryOptions.queryKey, data.data)
			void navigate({ to: '/dashboard' })
		},
		onError: (error) => {
			toast.error('No pudimos crear tu cuenta', {
				description: toUserMessage(error),
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
			queryClient.setQueryData(authQueryOptions.queryKey, data.data)
			toast.success('Perfil actualizado', {
				description: 'Guardamos tus cambios.',
			})
		},
		onError: (error) => {
			toast.error('No pudimos guardar tu perfil', {
				description: toUserMessage(error),
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
			toast.success('Cerraste sesión')
			void navigate({ to: '/login' })
		},
		onError: (error) => {
			toast.error('No pudimos cerrar sesión', {
				description: toUserMessage(error),
			})
		},
	})
}

/** An invalid, used or expired email link answers 400. */
function linkErrorMessage(error: unknown): string {
	return error instanceof ApiError && error.status === 400
		? 'El enlace no es válido o ya venció. Pide uno nuevo.'
		: toUserMessage(error)
}

export function useForgotPassword() {
	return useMutation({
		mutationFn: async (input: ForgotPasswordInput) => {
			const res = await api.post('/api/v1/auth/forgot-password', input)
			await throwIfNotOk(res)
		},
		onError: (error) => {
			toast.error('No pudimos enviar el enlace', {
				description: toUserMessage(error),
			})
		},
	})
}

export function useResetPassword() {
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async (input: ResetPasswordInput) => {
			const res = await api.post('/api/v1/auth/reset-password', input)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			toast.success('Tu contraseña está lista', {
				description: 'Ya puedes iniciar sesión.',
			})
			void navigate({ to: '/login' })
		},
		onError: (error) => {
			toast.error('No pudimos guardar tu contraseña', {
				description: linkErrorMessage(error),
			})
		},
	})
}

export function useVerifyEmail() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: VerifyEmailInput) => {
			const res = await api.post('/api/v1/auth/verify-email', input)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: authQueryOptions.queryKey,
			})
		},
		onError: (error) => {
			toast.error('No pudimos verificar tu email', {
				description: linkErrorMessage(error),
			})
		},
	})
}
