import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/layouts/public-layout'
import { OAuthConsentPage } from '@/slices/auth/components/oauth-consent-page'
import { nonEmptyText } from '@/utils/non-empty-text'

/** Better Auth's OAuth provider sends the user here (its `consentPage`) after sign-in. */
export const Route = createFileRoute('/_session/oauth/consent')({
	validateSearch: (search: Record<string, unknown>): { oauth_query?: string | undefined } => ({
		oauth_query: nonEmptyText(search.oauth_query),
	}),
	component: ConsentRoute,
})

function ConsentRoute() {
	const { oauth_query: oauthQuery } = Route.useSearch()
	if (oauthQuery) return <OAuthConsentPage oauthQuery={oauthQuery} />
	return (
		<PublicLayout
			title="Solicitud no válida"
			description="Este enlace no trae una solicitud de acceso."
		>
			<p role="alert" className="text-sm text-muted-foreground">
				Vuelve a la app que quieres conectar y empieza la conexión de nuevo.
			</p>
		</PublicLayout>
	)
}
