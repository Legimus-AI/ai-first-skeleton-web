import { zodResolver } from '@hookform/resolvers/zod'
import { type ForgotPasswordInput, forgotPasswordInputSchema } from '@repo/shared'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { PublicLayout } from '@/layouts/public-layout'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { useForgotPassword } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'

export const Route = createFileRoute('/forgot-password')({
	component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
	const forgotPassword = useForgotPassword()
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordInputSchema),
	})

	const onSubmit = (data: ForgotPasswordInput) => forgotPassword.mutate(data)
	const sent = forgotPassword.isSuccess

	return (
		<PublicLayout
			title={sent ? 'Revisa tu email' : '¿Olvidaste tu contraseña?'}
			description={
				sent
					? 'Te enviamos un enlace para crear una nueva contraseña.'
					: 'Te enviaremos un enlace para crear una nueva.'
			}
			onSubmit={handleSubmit(onSubmit)}
			footer={
				<>
					<Button
						type="submit"
						variant={sent ? 'outline' : 'primary'}
						className="w-full"
						loading={forgotPassword.isPending}
					>
						{sent ? 'Enviar de nuevo' : 'Enviar enlace'}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						<Link to="/login" className="text-primary underline-offset-4 hover:underline">
							Volver a iniciar sesión
						</Link>
					</p>
				</>
			}
		>
			{sent ? (
				<p className="text-sm text-muted-foreground">
					Si existe una cuenta con{' '}
					<span className="font-medium text-foreground">{getValues('email')}</span>, el enlace
					llegará en unos minutos. Revisa también tu carpeta de spam.
				</p>
			) : (
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
			)}
		</PublicLayout>
	)
}
