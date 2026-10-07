import { PublicLayout } from '@/layouts/public-layout'
import { Button } from '@/ui/button'
import { useOAuthClient, useOAuthConsent } from '../hooks/use-oauth'
import { oauthRequestOf } from '../oauth-request'
import { OAuthRedirectNotice } from './oauth-redirect-notice'
import { OAuthScopes } from './oauth-scopes'
import { SignedInAsNotice } from './signed-in-as-notice'

interface OAuthConsentPageProps {
	/** Better Auth's signed OAuth query, kept intact in the URL (`oauth_query`). */
	oauthQuery: string
}

/** An MCP client (Claude, an editor, an agent) asks for access to the signed-in account. */
export function OAuthConsentPage({ oauthQuery }: OAuthConsentPageProps) {
	const request = oauthRequestOf(oauthQuery)
	const oauthClient = useOAuthClient(request.clientId)
	const consent = useOAuthConsent(oauthQuery)

	// The registered name is the app's own claim; the client id stands in while it loads or is missing.
	const appName = oauthClient.data?.name ?? (oauthClient.isLoading ? undefined : request.clientId)
	const answering = consent.isPending || consent.isSuccess

	return (
		<PublicLayout
			title={appName ? `Conectar ${appName}` : 'Conectar una app'}
			description="Esta app quiere usar tu cuenta."
			onSubmit={() => consent.mutate(true)}
			footer={
				<>
					<Button
						type="submit"
						className="w-full"
						loading={consent.isPending && consent.variables}
						disabled={answering}
					>
						Permitir acceso
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						loading={consent.isPending && !consent.variables}
						disabled={answering}
						onClick={() => consent.mutate(false)}
					>
						Rechazar
					</Button>
				</>
			}
		>
			<OAuthRedirectNotice redirectUri={request.redirectUri} />
			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">Podrá:</p>
				<OAuthScopes scopes={request.scopes} />
			</div>
			<SignedInAsNotice />
		</PublicLayout>
	)
}
