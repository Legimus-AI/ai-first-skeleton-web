import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { authErrorField, authErrorMessage, isWrongPassword } from '../auth-error'
import { type ChangePasswordForm, changePasswordFormSchema } from '../auth-form-schemas'
import { useChangePassword } from '../hooks/use-account'
import { AuthFormField } from './auth-form-field'

export function ChangePasswordCard() {
	const changePassword = useChangePassword()
	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordFormSchema) })

	const onSubmit = ({ currentPassword, password }: ChangePasswordForm) =>
		changePassword.mutate(
			{ currentPassword, newPassword: password },
			{
				onSuccess: () => reset(),
				onError: (error) => {
					if (isWrongPassword(error)) {
						setError('currentPassword', { message: authErrorMessage(error) })
					} else if (authErrorField(error) === 'password') {
						setError('password', { message: authErrorMessage(error) })
					}
				},
			},
		)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Contraseña</CardTitle>
				<CardDescription>
					Al cambiarla cerramos tus otras sesiones. Si la olvidaste, pide un enlace desde el inicio
					de sesión. Si entras solo con Google, crea una contraseña primero desde «¿Olvidaste tu
					contraseña?».
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<AuthFormField
						id="current-password"
						label="Contraseña actual"
						type="password"
						placeholder="Tu contraseña actual"
						registration={register('currentPassword')}
						hasError={!!errors.currentPassword}
						errorMessage={errors.currentPassword?.message}
						autoComplete="current-password"
					/>
					<AuthFormField
						id="new-password"
						label="Contraseña nueva"
						type="password"
						placeholder={`Mínimo ${changePasswordFormSchema.shape.password.minLength} caracteres`}
						registration={register('password')}
						hasError={!!errors.password}
						errorMessage={errors.password?.message}
						autoComplete="new-password"
					/>
					<Button type="submit" loading={changePassword.isPending}>
						Cambiar contraseña
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
