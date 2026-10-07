import { Link } from '@tanstack/react-router'
import { useCurrentUser } from '../hooks/use-auth'

/** Under a consent or CLI approval: which account the app gets, and where to disconnect it. */
export function SignedInAsNotice() {
	const { data: user } = useCurrentUser()
	if (!user) return null
	return (
		<p className="text-xs text-muted-foreground">
			Entraste como <span className="font-medium text-foreground break-all">{user.email}</span>.
			Puedes desconectar esta app cuando quieras en{' '}
			<Link
				to="/settings/api-keys"
				hash="connected-apps-title"
				className="rounded-control text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				Apps conectadas
			</Link>
			.
		</p>
	)
}
