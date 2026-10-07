import { memberRoleSchema } from '@repo/shared'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MEMBER_ROLE_LABELS } from '@/constants/roles'
import { PublicLayout } from '@/layouts/public-layout'
import { Button, buttonVariants } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { InlineError } from '@/ui/inline-error'
import { Skeleton } from '@/ui/skeleton'
import { AuthApiError, authErrorMessage } from '../auth-error'
import { useResendVerificationEmail } from '../hooks/use-account-emails'
import { useAuthSession, useLogout } from '../hooks/use-auth'
import { useAnswerInvitation, useInvitation } from '../hooks/use-invitation'

interface AcceptInvitationPageProps {
	invitationId: string
	/** This page's own path, where signing in (or switching account) comes back to. */
	returnTo: string
}

/** The link in the invitation email: sign in or sign up with that email, then accept or reject. */
export function AcceptInvitationPage({ invitationId, returnTo }: AcceptInvitationPageProps) {
	const session = useAuthSession()
	const invitation = useInvitation(invitationId, Boolean(session.data))
	const answer = useAnswerInvitation(invitationId)
	const resend = useResendVerificationEmail(returnTo)
	const switchAccount = useLogout(returnTo)
	const [confirmReject, setConfirmReject] = useState(false)

	const loading = (
		<PublicLayout title="Te invitaron a un equipo" description="Buscamos tu invitación.">
			<Skeleton className="h-24 w-full" />
		</PublicLayout>
	)
	if (session.isPending) return loading

	if (!session.data) {
		return (
			<PublicLayout
				title="Te invitaron a un equipo"
				description="Inicia sesión o crea tu cuenta con el email que recibió la invitación."
				footer={
					<>
						<Link
							to="/login"
							search={{ redirect: returnTo }}
							className={buttonVariants({ className: 'w-full' })}
						>
							Iniciar sesión
						</Link>
						<Link
							to="/register"
							search={{ redirect: returnTo }}
							className={buttonVariants({ variant: 'outline', className: 'w-full' })}
						>
							Crear cuenta
						</Link>
					</>
				}
			>
				{session.isError && (
					<InlineError
						error={session.error}
						message={authErrorMessage(session.error)}
						onRetry={() => void session.refetch()}
					/>
				)}
			</PublicLayout>
		)
	}

	const { email } = session.data
	if (invitation.isError) {
		const code = invitation.error instanceof AuthApiError ? invitation.error.authCode : undefined
		const needsConfirmedEmail = code?.startsWith('EMAIL_VERIFICATION_REQUIRED') === true
		return (
			<PublicLayout
				title="No pudimos abrir la invitación"
				description={<span className="break-all">Entraste como {email}.</span>}
				footer={
					needsConfirmedEmail ? (
						<>
							<Button
								className="w-full"
								loading={invitation.isFetching}
								onClick={() => invitation.refetch()}
							>
								Ya confirmé mi email
							</Button>
							<Button
								variant="outline"
								className="w-full"
								loading={resend.isPending}
								onClick={() => resend.mutate(email)}
							>
								Reenviar el enlace
							</Button>
						</>
					) : (
						<Button
							variant="outline"
							className="w-full"
							loading={switchAccount.isPending}
							onClick={() => switchAccount.mutate()}
						>
							Usar otra cuenta
						</Button>
					)
				}
			>
				<InlineError
					error={invitation.error}
					message={authErrorMessage(invitation.error)}
					{...(!needsConfirmedEmail && { onRetry: () => void invitation.refetch() })}
				/>
			</PublicLayout>
		)
	}

	if (!invitation.data) return loading
	const { organizationName, inviterEmail, role } = invitation.data
	const knownRole = memberRoleSchema.safeParse(role)
	const roleLabel = knownRole.success ? MEMBER_ROLE_LABELS[knownRole.data] : role

	return (
		<>
			<PublicLayout
				title={`Únete a ${organizationName}`}
				description={
					<span className="break-all">
						{inviterEmail} te invitó como {roleLabel.toLowerCase()}.
					</span>
				}
				onSubmit={() => answer.mutate(true)}
				footer={
					<>
						<Button
							type="submit"
							className="w-full"
							loading={answer.isPending && answer.variables}
							disabled={answer.isPending}
						>
							Aceptar invitación
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							loading={answer.isPending && !answer.variables}
							disabled={answer.isPending}
							onClick={() => setConfirmReject(true)}
						>
							Rechazar
						</Button>
					</>
				}
			>
				<p className="text-sm text-muted-foreground">
					Entrarás con <span className="font-medium text-foreground break-all">{email}</span>.
				</p>
			</PublicLayout>
			<ConfirmDelete
				open={confirmReject}
				onOpenChange={setConfirmReject}
				onConfirm={() => answer.mutate(false, { onSettled: () => setConfirmReject(false) })}
				title="¿Rechazar la invitación?"
				description={`Para unirte después, ${inviterEmail} tendrá que invitarte otra vez.`}
				confirmLabel="Rechazar"
				isPending={answer.isPending}
			/>
		</>
	)
}
