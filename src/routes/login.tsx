import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { HOME_PATH } from '@/constants/routes'
import { PublicLayout } from '@/layouts/public-layout'
import { type LoginForm, loginFormSchema } from '@/slices/auth/auth-form-schemas'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { TurnstileWidget } from '@/slices/auth/components/turnstile-widget'
import { useCurrentUser, useLogin } from '@/slices/auth/hooks/use-auth'
import { useCaptcha } from '@/slices/auth/hooks/use-captcha'
import { Button } from '@/ui/button'
import { safeRedirectPath } from '@/utils/safe-redirect'

// WHY: Better Auth links Google to an existing account only once its email is confirmed; a password
// reset confirms it (the API claims the account), so that is the way in.
const GOOGLE_NOT_LINKED = 'account_not_linked'

export interface LoginSearch {
	/** Page to return to after signing in. */
	redirect?: string | undefined
	/** Set by Better Auth (its error code) when the Google sign-in failed. */
	error?: string | undefined
	/** Better Auth's signed OAuth query: an app (an MCP client) is asking for access. */
	oauth_query?: string | undefined
}

const optionalText = (value: unknown) =>
	typeof value === 'string' && value !== '' ? value : undefined

export const Route = createFileRoute('/login')({
	// WHY: the router merges the raw query with this result, so an unsafe redirect must be
	// overwritten with undefined; leaving the key out lets the raw value through.
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: safeRedirectPath(search.redirect),
		error: optionalText(search.error),
		oauth_query: optionalText(search.oauth_query),
	}),
	component: LoginPage,
})

function LoginPage() {
	const search = Route.useSearch()
	const target = {
		redirectTo: safeRedirectPath(search.redirect) ?? HOME_PATH,
		oauthQuery: search.oauth_query,
	}
	const { data: user } = useCurrentUser()
	const captcha = useCaptcha()
	const login = useLogin(target)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginFormSchema),
	})

	// Already signed in: `href` (a full path with its search) takes precedence over `to`. An OAuth
	// request still asks for the password here (Better Auth sends `prompt=login` this way).
	if (user && !target.oauthQuery) return <Navigate to="." href={target.redirectTo} replace />

	const onSubmit = (data: LoginForm) =>
		login.mutate({ ...data, captchaToken: captcha.token }, { onError: captcha.renew })

	return (
		<PublicLayout
			title="Inicia sesión"
			description={
				target.oauthQuery ? 'Entra a tu cuenta para conectar la app' : 'Entra a tu cuenta'
			}
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton {...target} />}
			footer={
				<>
					<Button
						type="submit"
						className="w-full"
						loading={login.isPending}
						disabled={!captcha.ready}
					>
						Iniciar sesión
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						¿No tienes cuenta?{' '}
						<Link
							to="/register"
							search={{ redirect: search.redirect, oauth_query: search.oauth_query }}
							className="text-primary font-medium underline-offset-4 hover:underline"
						>
							Regístrate
						</Link>
					</p>
				</>
			}
		>
			{search.error && (
				<p
					role="alert"
					className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
				>
					{search.error === GOOGLE_NOT_LINKED
						? 'Ya hay una cuenta con este email que aún no está confirmada. Recupérala con «¿Olvidaste tu contraseña?» y luego podrás entrar con Google.'
						: 'No pudimos iniciar sesión con Google. Inténtalo de nuevo o entra con tu email.'}
				</p>
			)}
			<AuthFormField
				id="email"
				label="Email"
				type="email"
				placeholder="tu@email.com"
				registration={register('email')}
				hasError={!!errors.email}
				errorMessage={errors.email?.message}
				autoComplete="email"
			/>
			<AuthFormField
				id="password"
				label="Contraseña"
				type="password"
				placeholder="Tu contraseña"
				registration={register('password')}
				hasError={!!errors.password}
				errorMessage={errors.password?.message}
				autoComplete="current-password"
			/>
			<div className="flex justify-end">
				<Link
					to="/forgot-password"
					className="text-sm text-primary underline-offset-4 hover:underline"
				>
					¿Olvidaste tu contraseña?
				</Link>
			</div>
			{captcha.siteKey && (
				<TurnstileWidget key={captcha.round} siteKey={captcha.siteKey} onToken={captcha.setToken} />
			)}
		</PublicLayout>
	)
}
