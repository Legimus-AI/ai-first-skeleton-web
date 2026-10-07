import { Hint } from '@/ui/hint'
import { redirectTargetOf } from '../oauth-request'

interface OAuthRedirectNoticeProps {
	redirectUri: string | undefined
}

/** Where the app receives the access, with a warning when that is this same computer. */
export function OAuthRedirectNotice({ redirectUri }: OAuthRedirectNoticeProps) {
	const target = redirectUri ? redirectTargetOf(redirectUri) : undefined
	if (!target) return null
	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Recibirá el acceso en{' '}
				<span className="font-medium text-foreground break-all">{target.host}</span>.
			</p>
			{target.isLoopback && (
				<Hint variant="warning">
					La app recibe el acceso en esta misma computadora. Aprueba solo si tú acabas de conectarla
					desde aquí, por ejemplo desde tu terminal o tu editor.
				</Hint>
			)}
		</div>
	)
}
