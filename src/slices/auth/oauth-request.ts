/** What the consent and device pages show about an app's request, in plain Spanish. */

export interface OAuthRequest {
	clientId: string | undefined
	redirectUri: string | undefined
	scopes: string[]
}

/** The client, redirect and scopes inside Better Auth's signed OAuth query. */
export function oauthRequestOf(oauthQuery: string): OAuthRequest {
	const params = new URLSearchParams(oauthQuery)
	return {
		clientId: params.get('client_id') ?? undefined,
		redirectUri: params.get('redirect_uri') ?? undefined,
		scopes: scopesOf(params.get('scope') ?? undefined),
	}
}

/** A space-separated OAuth scope string as a list. */
export function scopesOf(scope: string | undefined): string[] {
	return (scope ?? '').split(' ').filter(Boolean)
}

export interface RedirectTarget {
	/** The host (or, for an app's own scheme, the scheme) the access is handed to. */
	host: string
	/** The access goes to this same computer: only an app running here can receive it. */
	isLoopback: boolean
}

/** Where the app receives the access, and whether that is this computer (loopback). */
export function redirectTargetOf(redirectUri: string): RedirectTarget | undefined {
	let url: URL
	try {
		url = new URL(redirectUri)
	} catch {
		return undefined
	}
	const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
	const isLoopback =
		hostname === 'localhost' ||
		hostname.endsWith('.localhost') ||
		hostname === '::1' ||
		/^127(\.\d{1,3}){3}$/.test(hostname)
	return { host: url.host || url.protocol.replace(/:$/, ''), isLoopback }
}

export interface ScopeDescription {
	label: string
	detail?: string
}

const SCOPE_DESCRIPTIONS: Readonly<Record<string, ScopeDescription>> = {
	'*:read': { label: 'Leer tus datos' },
	'*:write': {
		label: 'Crear y modificar datos',
		detail: 'Incluye borrarlos. Nunca cambia quién tiene acceso a tu cuenta.',
	},
	full: {
		label: 'Hacer lo mismo que tú',
		detail: 'Menos gestionar el equipo, las claves y los webhooks.',
	},
	offline_access: {
		label: 'Seguir conectada',
		detail: 'Sin volver a pedirte permiso, hasta que la desconectes.',
	},
	openid: { label: 'Saber quién eres' },
	profile: { label: 'Ver tu nombre' },
	email: { label: 'Ver tu email' },
}

/** One scope in plain Spanish: `todos:read` reads "Leer todos". */
export function describeScope(scope: string): ScopeDescription {
	const known = SCOPE_DESCRIPTIONS[scope]
	if (known) return known
	const [resource, action] = scope.split(':')
	if (resource && action === 'read') return { label: `Leer ${resource}` }
	if (resource && action === 'write') return { label: `Crear y modificar ${resource}` }
	return { label: scope }
}
