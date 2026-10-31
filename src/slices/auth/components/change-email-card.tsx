import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { authErrorField, authErrorMessage } from '../auth-error'
import { type EmailForm, emailFormSchema } from '../auth-form-schemas'
import { useChangeEmail } from '../hooks/use-account'
import { useCurrentUser } from '../hooks/use-auth'
import { AuthFormField } from './auth-form-field'

export function ChangeEmailCard() {
	const { data: user } = useCurrentUser()
	const changeEmail = useChangeEmail()
	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<EmailForm>({ resolver: zodResolver(emailFormSchema) })

	const onSubmit = ({ email }: EmailForm) =>
		changeEmail.mutate(email, {
			onSuccess: () => reset(),
			onError: (error) => {
				if (authErrorField(error) === 'email') {
					setError('email', { message: authErrorMessage(error) })
				}
			},
		})

	if (user && !user.emailVerified) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Email</CardTitle>
					<CardDescription>
						Verifica tu correo antes de cambiarlo: revisa tu bandeja de entrada en{' '}
						<span className="font-medium text-foreground">{user.email}</span>.
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					Tu email actual es <span className="font-medium text-foreground">{user?.email}</span>. Te
					enviaremos un enlace para aprobar el cambio y luego otro al email nuevo para confirmarlo.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<AuthFormField
						id="new-email"
						label="Email nuevo"
						type="email"
						placeholder="tu@email.com"
						registration={register('email')}
						hasError={!!errors.email}
						errorMessage={errors.email?.message}
						autoComplete="email"
					/>
					<Button type="submit" loading={changeEmail.isPending}>
						Cambiar email
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
