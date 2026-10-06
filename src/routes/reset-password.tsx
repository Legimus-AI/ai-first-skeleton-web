import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordInputSchema } from '@repo/shared'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { PublicLayout } from '@/layouts/public-layout'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { useResetPassword } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'

export interface ResetPasswordSearch {
	token?: string
	/** Invited members land here to set their first password. */
	invited?: boolean
}

const passwordSchema = resetPasswordInputSchema.pick({ password: true })
type PasswordInput = z.infer<typeof passwordSchema>

export const Route = createFileRoute('/reset-password')({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		...(typeof search.token === 'string' ? { token: search.token } : {}),
		...(String(search.invited) === '1' ? { invited: true } : {}),
	}),
	component: ResetPasswordPage,
})

function ResetPasswordPage() {
	const { token, invited } = Route.useSearch()
	const resetPassword = useResetPassword()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PasswordInput>({
		resolver: zodResolver(passwordSchema),
	})

	const onSubmit = ({ password }: PasswordInput) => {
		if (token) resetPassword.mutate({ token, password })
	}

	return (
		<PublicLayout
			title={invited ? 'Crea tu contraseña' : 'Nueva contraseña'}
			description={
				invited
					? 'Elige la contraseña con la que entrarás a tu equipo.'
					: 'Elige una nueva contraseña para tu cuenta.'
			}
			onSubmit={handleSubmit(onSubmit)}
			footer={
				token ? (
					<Button type="submit" className="w-full" loading={resetPassword.isPending}>
						{invited ? 'Crear contraseña' : 'Guardar contraseña'}
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
					placeholder={`Mínimo ${resetPasswordInputSchema.shape.password.minLength} caracteres`}
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
