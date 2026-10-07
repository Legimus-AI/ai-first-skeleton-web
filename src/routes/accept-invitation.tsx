import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicLayout } from '@/layouts/public-layout'
import { AcceptInvitationPage } from '@/slices/auth/components/accept-invitation-page'
import { nonEmptyText } from '@/utils/non-empty-text'

/** The invitation email links here with `?token=<invitation id>`. Public: the person may have no account yet. */
export const Route = createFileRoute('/accept-invitation')({
	validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => ({
		token: nonEmptyText(search.token),
	}),
	component: AcceptInvitationRoute,
})

function AcceptInvitationRoute() {
	const { token } = Route.useSearch()
	if (token) {
		const returnTo = `/accept-invitation?token=${encodeURIComponent(token)}`
		return <AcceptInvitationPage invitationId={token} returnTo={returnTo} />
	}
	return (
		<PublicLayout
			title="Invitación no válida"
			description="Abre el enlace completo que te llegó por email."
			footer={
				<p className="text-center text-sm">
					<Link
						to="/login"
						className="rounded-control text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Volver a iniciar sesión
					</Link>
				</p>
			}
		>
			<p role="alert" className="text-sm text-muted-foreground">
				Si venció, pide a quien te invitó que te envíe otra invitación.
			</p>
		</PublicLayout>
	)
}
