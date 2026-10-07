import { createFileRoute, Link } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { PublicLayout } from '@/layouts/public-layout'
import { useVerifyEmail } from '@/slices/auth/hooks/use-account-emails'
import { Button, buttonVariants } from '@/ui/button'
import { safeRedirectPath } from '@/utils/safe-redirect'

export const Route = createFileRoute('/verify-email')({
	validateSearch: (search: Record<string, unknown>): { token?: string; redirect?: string } => ({
		...(typeof search.token === 'string' && { token: search.token }),
		// The page the person was on when they signed up, such as the invitation they were opening.
		...(typeof search.redirect === 'string' && { redirect: search.redirect }),
	}),
	component: VerifyEmailPage,
})

// One click confirms: opening the link never changes anything by itself (mail scanners open links).
function VerifyEmailPage() {
	const { token, redirect } = Route.useSearch()
	const verifyEmail = useVerifyEmail()
	const next = safeRedirectPath(redirect)

	const onSubmit = (event?: FormEvent) => {
		event?.preventDefault()
		if (token) verifyEmail.mutate(token)
	}

	if (verifyEmail.isSuccess) {
		return (
			<PublicLayout
				title="Email verificado"
				description="Tu cuenta quedó confirmada."
				onSubmit={onSubmit}
				footer={
					<Link to="." href={next ?? '/'} className={buttonVariants({ className: 'w-full' })}>
						{next ? 'Continuar' : 'Ir a la app'}
					</Link>
				}
			>
				<p className="text-sm text-muted-foreground">Ya puedes usar todas las funciones.</p>
			</PublicLayout>
		)
	}

	return (
		<PublicLayout
			title="Verifica tu email"
			description="Confirma que este email es tuyo."
			onSubmit={onSubmit}
			footer={
				token ? (
					<Button type="submit" className="w-full" loading={verifyEmail.isPending}>
						Confirmar mi email
					</Button>
				) : (
					<p className="text-center text-sm">
						<Link to="/login" className="text-primary underline-offset-4 hover:underline">
							Volver a iniciar sesión
						</Link>
					</p>
				)
			}
		>
			{!token && (
				<p role="alert" className="text-sm text-muted-foreground">
					Este enlace no es válido. Abre el enlace completo que te enviamos por email.
				</p>
			)}
		</PublicLayout>
	)
}
