/** Better Auth's signed OAuth query, kept as one opaque `oauth_query` search param. */

// Better Auth's signed-query format: the signature, and the names it covers.
const SIGNATURE_PARAM = 'sig'
const SIGNED_NAMES_PARAM = 'ba_param'

/** The search param the login and consent pages read the signed OAuth query from. */
export const OAUTH_QUERY_PARAM = 'oauth_query'

/** The signed OAuth query in `search` (only the params Better Auth signed), or undefined. */
export function signedOAuthQuery(search: string): string | undefined {
	const params = new URLSearchParams(search)
	const signedNames = new Set(params.getAll(SIGNED_NAMES_PARAM))
	if (!params.has(SIGNATURE_PARAM) || signedNames.size === 0) return undefined
	const signed = new URLSearchParams()
	for (const [key, value] of params) {
		if (key === SIGNATURE_PARAM || key === SIGNED_NAMES_PARAM || signedNames.has(key)) {
			signed.append(key, value)
		}
	}
	return signed.toString()
}

/**
 * `search` with Better Auth's signed params folded into one `oauth_query`; other params stay.
 * WHY: its signed names (`ba_param`) repeat one key, which the router would re-encode as a JSON
 * array, breaking the signature.
 */
export function foldSignedOAuthQuery(search: string): string {
	const oauthQuery = signedOAuthQuery(search)
	if (!oauthQuery) return search
	const signedKeys = new Set(new URLSearchParams(oauthQuery).keys())
	const unsigned = new URLSearchParams()
	for (const [key, value] of new URLSearchParams(search)) {
		if (!signedKeys.has(key)) unsigned.append(key, value)
	}
	unsigned.set(OAUTH_QUERY_PARAM, oauthQuery)
	return `?${unsigned.toString()}`
}
