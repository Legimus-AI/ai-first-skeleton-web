import { type AuthResponse, authResponseSchema, type UpdateProfile, type User } from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { HOME_PATH } from '@/constants/routes'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk } from '@/services/api-error'
import { safeRedirectPath } from '@/utils/safe-redirect'
import { OAUTH_QUERY_PARAM } from '@/utils/signed-oauth-query'
import {
	getSession,
	signInWithEmail,
	signInWithGoogle,
	signOut,
	signUpWithEmail,
	updateProfile,
} from '../auth-client'
import { authErrorMessage } from '../auth-error'
import type { LoginForm, RegisterForm } from '../auth-form-schemas'
import { type AuthRedirect, followAuthRedirect } from '../auth-redirect'

// WHY: the session can end server-side at any moment (logout in another tab, revocation, another
// localhost app replacing the cookie), so the cached user must be re-checked, not trusted forever.
const AUTH_STALE_TIME_MS = 60_000

/** The signed-in user with the role and organization of their live membership (REST, not Better Auth). */
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

/** The signed-in user with a team (REST /me); null without a session or without a team. */
export function useCurrentUser() {
	return useQuery(authQueryOptions)
}

/**
 * Who holds the session cookie (Better Auth's session), team or not; null when nobody is signed in.
 * WHY: an invited person may have a session but no team yet, and /me answers them 401.
 */
export function useAuthSession() {
	return useQuery({ queryKey: ['auth', 'session'], queryFn: getSession, retry: false })
}

export interface SignInTarget {
	/** Page on this site to open once signed in. */
	redirectTo: string
	/** Better Auth's signed OAuth query: signing in resumes that app's authorization instead. */
	oauthQuery: string | undefined
}

/** A Turnstile token, when the captcha is on (`VITE_TURNSTILE_SITE_KEY`). */
export interface CaptchaInput {
	captchaToken: string | null
}

/** Once a session exists: follow Better Auth's `url` (an OAuth resume), or open `redirectTo`. */
function useContinueSignedIn() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return ({ url }: AuthRedirect, redirectTo: string) => {
		// Data cached under a previous account must never show under this one.
		queryClient.clear()
		if (url) return followAuthRedirect(url)
		// Checked again where it is used: only a path on this site, never another host.
		void navigate({ href: safeRedirectPath(redirectTo) ?? HOME_PATH })
	}
}

/** Signs in with email and password, then goes where `target` says. */
export function useLogin(target: SignInTarget) {
	const continueSignedIn = useContinueSignedIn()
	return useMutation({
		mutationFn: (input: LoginForm & CaptchaInput) =>
			signInWithEmail({ ...input, oauthQuery: target.oauthQuery }),
		onSuccess: (response) => continueSignedIn(response, target.redirectTo),
		onError: (error) => {
			toast.error('No pudimos iniciar sesión', { description: authErrorMessage(error) })
		},
	})
}

/** Creates an account (Better Auth signs it in), then goes where `target` says. */
export function useRegister(target: SignInTarget) {
	const continueSignedIn = useContinueSignedIn()
	return useMutation({
		mutationFn: (input: RegisterForm & CaptchaInput) =>
			signUpWithEmail({
				...input,
				oauthQuery: target.oauthQuery,
				// Where the confirmation link goes on to, such as the invitation being opened.
				callbackURL:
					target.redirectTo === HOME_PATH ? undefined : safeRedirectPath(target.redirectTo),
			}),
		onSuccess: (response) => continueSignedIn(response, target.redirectTo),
		onError: (error) => {
			toast.error('No pudimos crear tu cuenta', { description: authErrorMessage(error) })
		},
	})
}

/** Starts the Google sign-in: Better Auth answers Google's URL and the browser goes there. */
export function useGoogleSignIn(target: SignInTarget) {
	return useMutation({
		mutationFn: async () => {
			const origin = globalThis.location.origin
			// A failure comes back to the login with `?error=`, keeping where the person was going.
			const retryLogin = new URL('/login', origin)
			if (target.redirectTo !== HOME_PATH) {
				retryLogin.searchParams.set('redirect', target.redirectTo)
			}
			if (target.oauthQuery) retryLogin.searchParams.set(OAUTH_QUERY_PARAM, target.oauthQuery)
			const { url } = await signInWithGoogle({
				callbackURL: new URL(target.redirectTo, origin).href,
				errorCallbackURL: retryLogin.href,
				oauthQuery: target.oauthQuery,
			})
			if (!url) throw new Error('Better Auth answered the Google sign-in without a URL')
			return url
		},
		onSuccess: followAuthRedirect,
		onError: (error) => {
			toast.error('No pudimos iniciar sesión con Google', { description: authErrorMessage(error) })
		},
	})
}

/** Saves the profile name (Better Auth's update-user) and refreshes the signed-in user. */
export function useUpdateProfile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (input: UpdateProfile) => updateProfile(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: authQueryOptions.queryKey })
			toast.success('Perfil actualizado', { description: 'Guardamos tus cambios.' })
		},
		onError: (error) => {
			toast.error('No pudimos guardar tu perfil', { description: authErrorMessage(error) })
		},
	})
}

/** Signs out; `redirectTo` is where the next sign-in returns (e.g. an invitation for another email). */
export function useLogout(redirectTo?: string) {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			queryClient.clear()
			toast.success('Cerraste sesión')
			void navigate({ to: '/login', search: { redirect: safeRedirectPath(redirectTo) } })
		},
		onError: (error) => {
			toast.error('No pudimos cerrar sesión', { description: authErrorMessage(error) })
		},
	})
}
