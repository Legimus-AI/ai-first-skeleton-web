import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { PublicLayout } from '@/layouts/public-layout'
import { authErrorField, authErrorMessage } from '@/slices/auth/auth-error'
import { type NewPasswordForm, newPasswordFormSchema } from '@/slices/auth/auth-form-schemas'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { useResetPassword } from '@/slices/auth/hooks/use-account-emails'
import { Button } from '@/ui/button'

export const Route = createFileRoute('/reset-password')({
	validateSearch: (search: Record<string, unknown>): { token?: string } =>
		typeof search.token === 'string' ? { token: search.token } : {},
	component: ResetPasswordPage,
})

function ResetPasswordPage() {
	const { token } = Route.useSearch()
	const resetPassword = useResetPassword()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<NewPasswordForm>({
		resolver: zodResolver(newPasswordFormSchema),
	})

	const onSubmit = ({ password }: NewPasswordForm) => {
		if (!token) return
		resetPassword.mutate(
			{ token, password },
			{
				// A leaked or too-short password belongs under the field, not only in the toast.
				onError: (error) => {
					if (authErrorField(error) === 'password') {
						setError('password', { message: authErrorMessage(error) })
					}
				},
			},
		)
	}

	return (
		<PublicLayout
			title="Nueva contraseña"
			description="Elige una nueva contraseña para tu cuenta."
			onSubmit={handleSubmit(onSubmit)}
			footer={
				token ? (
					<Button type="submit" className="w-full" loading={resetPassword.isPending}>
						Guardar contraseña
					</Button>
				) : (
					<p className="text-center text-sm">
						<Link to="/forgot-password" className="text-primary underline-offset-4 hover:underline">
							Pedir un enlace nuevo
						</Link>
					</p>
				)
			}
		>
			{token ? (
				<AuthFormField
					id="password"
					label="Contraseña"
					type="password"
					placeholder={`Mínimo ${newPasswordFormSchema.shape.password.minLength} caracteres`}
					registration={register('password')}
					hasError={!!errors.password}
					errorMessage={errors.password?.message}
					autoComplete="new-password"
				/>
			) : (
				<p role="alert" className="text-sm text-muted-foreground">
					Este enlace no es válido. Pide uno nuevo para crear tu contraseña.
				</p>
			)}
		</PublicLayout>
	)
}
