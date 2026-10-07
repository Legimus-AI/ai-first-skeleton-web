import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	answerOAuthConsent,
	decideDeviceRequest,
	getDeviceRequest,
	getOAuthClient,
} from '../auth-client'
import { authErrorMessage } from '../auth-error'
import { followAuthRedirect } from '../auth-redirect'

// OAuth for MCP clients (consent) and for the CLI (device login approval), both Better Auth's.

/** The app asking for access, as Better Auth registered it (the name is the app's own claim). */
export function useOAuthClient(clientId: string | undefined) {
	return useQuery({
		queryKey: ['auth', 'oauth-client', clientId],
		queryFn: clientId ? () => getOAuthClient(clientId) : skipToken,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	})
}

/** Approves or denies the request; the browser then goes back to the app with the answer. */
export function useOAuthConsent(oauthQuery: string) {
	return useMutation({
		mutationFn: async (accept: boolean) => {
			const { url } = await answerOAuthConsent({ accept, oauthQuery })
			if (!url) throw new Error('Better Auth answered the consent without a redirect')
			return url
		},
		onSuccess: followAuthRedirect,
		onError: (error) => {
			toast.error('No pudimos responder a la app', { description: authErrorMessage(error) })
		},
	})
}

const deviceRequestKey = (userCode: string | undefined) => ['auth', 'device', userCode] as const

/** On the device page, Better Auth's OAuth errors are about the code the person typed. */
export const DEVICE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
	invalid_request: 'Ese código no es válido o ya se usó. Revisa que esté bien escrito.',
	expired_token: 'El código venció. Vuelve a iniciar sesión desde tu terminal.',
	access_denied: 'Este código ya lo abrió otra cuenta.',
}

/** The CLI login behind `userCode`. Reading it while signed in claims it for this account. */
export function useDeviceRequest(userCode: string | undefined) {
	return useQuery({
		queryKey: deviceRequestKey(userCode),
		queryFn: userCode ? () => getDeviceRequest(userCode) : skipToken,
		retry: false,
		// WHY: one read claims the code; reading again only repeats what the page already shows.
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	})
}

/** Approves or denies a CLI login; the terminal waiting on it gets the answer. */
export function useDecideDeviceRequest(userCode: string) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (approve: boolean) => decideDeviceRequest({ userCode, approve }),
		onSuccess: (_data, approve) => {
			toast.success(approve ? 'Acceso aprobado' : 'Acceso rechazado')
		},
		onError: (error) => {
			void queryClient.invalidateQueries({ queryKey: deviceRequestKey(userCode) })
			toast.error('No pudimos responder', {
				description: authErrorMessage(error, DEVICE_ERROR_MESSAGES),
			})
		},
	})
}
