import { PublicLayout } from '@/layouts/public-layout'
import { Button } from '@/ui/button'
import { useLogout } from '../hooks/use-auth'

interface NoTeamPageProps {
	/** The email of the session, so the person knows which account is signed in. */
	email: string
}

/** Signed in but in no team yet: the account was invited and the invitation is still open. */
export function NoTeamPage({ email }: NoTeamPageProps) {
	const logout = useLogout()
	return (
		<PublicLayout
			title="Te invitaron a un equipo"
			description="Acepta la invitación para entrar."
			footer={
				<Button
					type="button"
					variant="outline"
					className="w-full"
					loading={logout.isPending}
					onClick={() => logout.mutate()}
				>
					Cerrar sesión
				</Button>
			}
		>
			<p className="text-sm text-muted-foreground">
				Entraste como <span className="font-medium text-foreground break-all">{email}</span>. Abre
				el enlace de la invitación que te llegó por email para unirte al equipo.
			</p>
		</PublicLayout>
	)
}
