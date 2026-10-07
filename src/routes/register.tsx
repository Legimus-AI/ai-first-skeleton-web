import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { HOME_PATH } from '@/constants/routes'
import { PublicLayout } from '@/layouts/public-layout'
import { authErrorField, authErrorMessage } from '@/slices/auth/auth-error'
import { type RegisterForm, registerFormSchema } from '@/slices/auth/auth-form-schemas'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { CAPTCHA_STATUS_ID, TurnstileWidget } from '@/slices/auth/components/turnstile-widget'
import { useCurrentUser, useRegister } from '@/slices/auth/hooks/use-auth'
import { useCaptcha } from '@/slices/auth/hooks/use-captcha'
import { Button } from '@/ui/button'
import { nonEmptyText } from '@/utils/non-empty-text'
import { safeRedirectPath } from '@/utils/safe-redirect'
import type { LoginSearch } from './login'

type RegisterSearch = Omit<LoginSearch, 'error'>

export const Route = createFileRoute('/register')({
	// WHY: as on /login, an unsafe redirect must be overwritten with undefined, not left out.
	validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
		redirect: safeRedirectPath(search.redirect),
		oauth_query: nonEmptyText(search.oauth_query),
	}),
	component: RegisterPage,
})

function RegisterPage() {
	const search = Route.useSearch()
	const target = {
		redirectTo: safeRedirectPath(search.redirect) ?? HOME_PATH,
		oauthQuery: search.oauth_query,
	}
	const { data: user } = useCurrentUser()
	const captcha = useCaptcha()
	const registerMutation = useRegister(target)
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<RegisterForm>({
		resolver: zodResolver(registerFormSchema),
	})

	if (user && !target.oauthQuery) return <Navigate to="." href={target.redirectTo} replace />

	const onSubmit = (data: RegisterForm) =>
		registerMutation.mutate(
			{ ...data, captchaToken: captcha.token },
			{
				onError: (error) => {
					captcha.renew()
					const field = authErrorField(error)
					if (field) setError(field, { message: authErrorMessage(error) })
				},
			},
		)

	return (
		<PublicLayout
			title="Crea tu cuenta"
			description="Regístrate para empezar"
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton {...target} />}
			footer={
				<>
					<Button
						type="submit"
						className="w-full"
						loading={registerMutation.isPending}
						disabled={!captcha.ready}
						aria-describedby={captcha.ready ? undefined : CAPTCHA_STATUS_ID}
					>
						Crear cuenta
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						¿Ya tienes cuenta?{' '}
						<Link
							to="/login"
							search={{ redirect: search.redirect, oauth_query: search.oauth_query }}
							className="rounded-control text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							Inicia sesión
						</Link>
					</p>
				</>
			}
		>
			<AuthFormField
				id="name"
				label="Nombre"
				type="text"
				placeholder="Tu nombre completo"
				registration={register('name')}
				hasError={!!errors.name}
				errorMessage={errors.name?.message}
				autoComplete="name"
			/>
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
				placeholder={`Mínimo ${registerFormSchema.shape.password.minLength} caracteres`}
				registration={register('password')}
				hasError={!!errors.password}
				errorMessage={errors.password?.message}
				autoComplete="new-password"
			/>
			{captcha.siteKey && (
				<TurnstileWidget key={captcha.round} siteKey={captcha.siteKey} onToken={captcha.setToken} />
			)}
		</PublicLayout>
	)
}
