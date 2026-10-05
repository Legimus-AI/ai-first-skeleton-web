import { zodResolver } from '@hookform/resolvers/zod'
import { type Login, loginSchema } from '@repo/shared'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { PublicLayout } from '@/layouts/public-layout'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { useCurrentUser, useLogin } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { safeRedirectPath } from '@/utils/safe-redirect'

export interface LoginSearch {
	/** Page to return to after signing in. */
	redirect?: string
	/** Set by the backend when the Google sign-in failed. */
	error?: 'oauth'
}

export const Route = createFileRoute('/login')({
	validateSearch: (search: Record<string, unknown>): LoginSearch => {
		const redirect = safeRedirectPath(search.redirect)
		return {
			...(redirect ? { redirect } : {}),
			...(search.error === 'oauth' ? { error: 'oauth' as const } : {}),
		}
	},
	component: LoginPage,
})

function LoginPage() {
	const search = Route.useSearch()
	const redirectTo = search.redirect ?? '/dashboard'
	const { data: user } = useCurrentUser()
	const login = useLogin(redirectTo)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Login>({
		resolver: zodResolver(loginSchema),
	})

	// Already signed in: `href` (a full path with its search) takes precedence over `to`.
	if (user) return <Navigate to="." href={redirectTo} replace />

	const onSubmit = (data: Login) => login.mutate(data)

	return (
		<PublicLayout
			title="Inicia sesión"
			description="Entra a tu cuenta"
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton />}
			footer={
				<>
					<Button type="submit" className="w-full aether-squish" loading={login.isPending}>
						Iniciar sesión
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						¿No tienes cuenta?{' '}
						<Link
							to="/register"
							className="text-primary font-medium underline-offset-4 hover:underline"
						>
							Regístrate
						</Link>
					</p>
				</>
			}
		>
			{search.error === 'oauth' && (
				<p
					role="alert"
					className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
				>
					No pudimos iniciar sesión con Google. Inténtalo de nuevo o entra con tu email.
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
		</PublicLayout>
	)
}
