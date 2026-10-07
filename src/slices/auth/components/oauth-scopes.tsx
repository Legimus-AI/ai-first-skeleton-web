import { Check } from '@/ui/icons'
import { describeScope } from '../oauth-request'

interface OAuthScopesProps {
	scopes: string[]
}

/** What an app may do with the account, one plain-Spanish line per scope. */
export function OAuthScopes({ scopes }: OAuthScopesProps) {
	if (scopes.length === 0) {
		return <p className="text-sm text-muted-foreground">No pide permisos sobre tus datos.</p>
	}
	return (
		<ul className="space-y-2.5" aria-label="Lo que podrá hacer">
			{scopes.map((scope) => {
				const { label, detail } = describeScope(scope)
				return (
					<li key={scope} className="flex gap-2.5">
						<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
						<span className="min-w-0">
							<span className="block text-sm text-foreground">{label}</span>
							{detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
						</span>
					</li>
				)
			})}
		</ul>
	)
}
