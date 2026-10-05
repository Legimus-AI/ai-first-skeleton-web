import { zodResolver } from '@hookform/resolvers/zod'
import { type Register, registerSchema } from '@repo/shared'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { PublicLayout } from '@/layouts/public-layout'
import { setFieldErrors } from '@/services/api-error'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { useCurrentUser, useRegister } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'

export const Route = createFileRoute('/register')({
	component: RegisterPage,
})

function RegisterPage() {
	const { data: user } = useCurrentUser()
	const registerMutation = useRegister()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Register>({
		resolver: zodResolver(registerSchema),
	})

	if (user) return <Navigate to="/dashboard" replace />

	const onSubmit = (data: Register) =>
		registerMutation.mutate(data, {
			onError: (error) => setFieldErrors(error, setError),
		})

	return (
		<PublicLayout
			title="Crea tu cuenta"
			description="Regístrate para empezar"
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton />}
			footer={
				<>
					<Button type="submit" className="w-full" loading={registerMutation.isPending}>
						Crear cuenta
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						¿Ya tienes cuenta?{' '}
						<Link to="/login" className="text-primary underline-offset-4 hover:underline">
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
				placeholder={`Mínimo ${registerSchema.shape.password.minLength} caracteres`}
				registration={register('password')}
				hasError={!!errors.password}
				errorMessage={errors.password?.message}
				autoComplete="new-password"
			/>
		</PublicLayout>
	)
}
