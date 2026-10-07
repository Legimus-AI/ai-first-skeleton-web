import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
	requestPasswordReset,
	resetPassword,
	sendVerificationEmail,
	verifyEmail,
} from '../auth-client'
import { authErrorMessage } from '../auth-error'
import type { EmailForm } from '../auth-form-schemas'
import { authQueryOptions, type CaptchaInput } from './use-auth'

// The flows behind the links in the account emails: reset the password, confirm the email.

/** Emails a link to set a new password, if an account has that email. */
export function useForgotPassword() {
	return useMutation({
		mutationFn: (input: EmailForm & CaptchaInput) => requestPasswordReset(input),
		onError: (error) => {
			toast.error('No pudimos enviar el enlace', { description: authErrorMessage(error) })
		},
	})
}

/** Saves the new password with the emailed token, then opens the login. */
export function useResetPassword() {
	const navigate = useNavigate()
	return useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			toast.success('Tu contraseña está lista', { description: 'Ya puedes iniciar sesión.' })
			void navigate({ to: '/login' })
		},
		onError: (error) => {
			toast.error('No pudimos guardar tu contraseña', { description: authErrorMessage(error) })
		},
	})
}

/** Confirms the email with the emailed token and refreshes the signed-in user. */
export function useVerifyEmail() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: verifyEmail,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: authQueryOptions.queryKey })
		},
		onError: (error) => {
			toast.error('No pudimos verificar tu email', { description: authErrorMessage(error) })
		},
	})
}

/** Sends the confirmation link again, which goes on to `returnTo` (an invitation waits for it). */
export function useResendVerificationEmail(returnTo?: string) {
	return useMutation({
		mutationFn: (email: string) => sendVerificationEmail(email, returnTo),
		onSuccess: (_data, email) => {
			toast.success('Te enviamos el enlace', { description: `Revisa ${email}.` })
		},
		onError: (error) => {
			toast.error('No pudimos enviar el enlace', { description: authErrorMessage(error) })
		},
	})
}
