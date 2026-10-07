import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { PublicLayout } from '@/layouts/public-layout'
import { type EmailForm, emailFormSchema } from '@/slices/auth/auth-form-schemas'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { CAPTCHA_STATUS_ID, TurnstileWidget } from '@/slices/auth/components/turnstile-widget'
import { useForgotPassword } from '@/slices/auth/hooks/use-account-emails'
import { useCaptcha } from '@/slices/auth/hooks/use-captcha'
import { Button } from '@/ui/button'

export const Route = createFileRoute('/forgot-password')({
	component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
	const forgotPassword = useForgotPassword()
	const captcha = useCaptcha()
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<EmailForm>({
		resolver: zodResolver(emailFormSchema),
	})

	// A captcha token is spent on every try, sent or not: "Enviar de nuevo" needs a fresh one.
	const onSubmit = (data: EmailForm) =>
		forgotPassword.mutate({ ...data, captchaToken: captcha.token }, { onSettled: captcha.renew })
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
						disabled={!captcha.ready}
						aria-describedby={captcha.ready ? undefined : CAPTCHA_STATUS_ID}
					>
						{sent ? 'Enviar de nuevo' : 'Enviar enlace'}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						<Link
							to="/login"
							className="rounded-control text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
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
			{captcha.siteKey && (
				<TurnstileWidget key={captcha.round} siteKey={captcha.siteKey} onToken={captcha.setToken} />
			)}
		</PublicLayout>
	)
}
