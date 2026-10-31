import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { unsubscribeFromPush } from '@/hooks/use-push-notifications'
import { api } from '@/services/api-client'
import { throwIfNotOk, toUserMessage } from '@/services/api-error'
import {
	changeEmail,
	changePassword,
	deleteAccount,
	listSessions,
	revokeOtherSessions,
	revokeSession,
} from '../auth-client'
import { AuthApiError, authErrorMessage } from '../auth-error'

// The signed-in person's own security: password, email, sessions, deleting the account, the data export.

const SESSIONS_KEY = ['auth', 'sessions'] as const

const LAST_OWNER_OF_SHARED_TEAM =
	'Eres el último propietario de una organización con más miembros. Pasa la propiedad a otro miembro o quítalos antes de borrar tu cuenta.'

/** Saves a new password; every other session ends. */
export function useChangePassword() {
	return useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			toast.success('Contraseña cambiada', { description: 'Cerramos tus otras sesiones.' })
		},
		onError: (error) => {
			toast.error('No pudimos cambiar tu contraseña', { description: authErrorMessage(error) })
		},
	})
}

/** Asks for a new email; the current address approves first, then the new one confirms. */
export function useChangeEmail() {
	return useMutation({
		mutationFn: (newEmail: string) => changeEmail({ newEmail, callbackURL: '/settings/security' }),
		// WHY: Better Auth answers the same whether or not the address is taken, so the message names
		// only the current address, the one that always gets the first link.
		onSuccess: () => {
			toast.success('Revisa tu bandeja de entrada', {
				description:
					'Te enviamos un enlace a tu email actual. Ábrelo para aprobar el cambio; luego te escribiremos al email nuevo.',
			})
		},
		onError: (error) => {
			toast.error('No pudimos cambiar tu email', { description: authErrorMessage(error) })
		},
	})
}

export const sessionsQueryOptions = queryOptions({
	queryKey: SESSIONS_KEY,
	queryFn: listSessions,
})

/** The browsers and devices signed in to this account. */
export function useSessions() {
	return useQuery(sessionsQueryOptions)
}

/** Signs one session out. */
export function useRevokeSession() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: revokeSession,
		onSuccess: () => {
			toast.success('Sesión cerrada')
		},
		onError: (error) => {
			toast.error('No pudimos cerrar la sesión', { description: authErrorMessage(error) })
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
	})
}

/** Signs out every session but this one. */
export function useRevokeOtherSessions() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: revokeOtherSessions,
		onSuccess: () => {
			toast.success('Cerramos tus otras sesiones')
		},
		onError: (error) => {
			toast.error('No pudimos cerrar las otras sesiones', { description: authErrorMessage(error) })
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
	})
}

/** Deletes the account (password required), then leaves for the login. */
export function useDeleteAccount() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async (password: string) => {
			// WHY: the push delete needs the session, which the account deletion ends; a failed cleanup must not block it.
			await unsubscribeFromPush().catch((error: unknown) =>
				console.warn('Push unsubscribe on account deletion failed', error),
			)
			await deleteAccount(password)
		},
		onSuccess: () => {
			queryClient.clear()
			void navigate({ to: '/login', search: { redirect: undefined } })
			toast.success('Tu cuenta fue eliminada')
		},
		onError: (error) => {
			toast.error('No pudimos eliminar tu cuenta', {
				description:
					error instanceof AuthApiError && error.status === 409
						? LAST_OWNER_OF_SHARED_TEAM
						: authErrorMessage(error),
			})
		},
	})
}

/** Downloads everything the account holds about the person as a JSON file (Ley 29733). */
export function useExportMyData() {
	return useMutation({
		mutationFn: async () => {
			const exportResponse = await api.get('/api/v1/me/export')
			await throwIfNotOk(exportResponse)
			const exportFile = URL.createObjectURL(await exportResponse.blob())
			const downloadLink = document.createElement('a')
			downloadLink.href = exportFile
			downloadLink.download = 'mis-datos.json'
			downloadLink.click()
			URL.revokeObjectURL(exportFile)
		},
		onError: (error) => {
			toast.error('No pudimos exportar tus datos', { description: toUserMessage(error) })
		},
	})
}
