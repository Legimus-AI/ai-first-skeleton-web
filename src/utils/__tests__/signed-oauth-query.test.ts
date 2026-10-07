import { defaultParseSearch, defaultStringifySearch } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { foldSignedOAuthQuery, signedOAuthQuery } from '@/utils/signed-oauth-query'

/** A query shaped like the one Better Auth appends to the login page (names listed, then signed). */
function betterAuthSignedQuery(): string {
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: 'claude-code',
		redirect_uri: 'http://127.0.0.1:53682/callback',
		scope: '*:read *:write offline_access',
		// A value the router would turn into the number 100000 if it parsed it on its own.
		state: '1e5',
		code_challenge: '-Wn3pX8f0Q',
		exp: '1791400000',
		ba_iat: '1791399400000',
	})
	for (const name of [...params.keys(), 'ba_param'].sort()) params.append('ba_param', name)
	params.set('sig', 'c2lnbmF0dXJl')
	return params.toString()
}

/** What the router writes back to the address bar after reading `search`. */
const routerRoundTrip = (search: string) => defaultStringifySearch(defaultParseSearch(search))

describe('signed OAuth query', () => {
	it('keeps every signed param, the repeated names included', () => {
		const signed = signedOAuthQuery(`?${betterAuthSignedQuery()}&redirect=%2Ftodos`)
		const params = new URLSearchParams(signed)
		expect(params.getAll('ba_param')).toHaveLength(9)
		expect(params.get('sig')).toBe('c2lnbmF0dXJl')
		expect(params.has('redirect')).toBe(false)
	})

	it('is undefined for a query Better Auth did not sign', () => {
		expect(signedOAuthQuery('?redirect=%2Ftodos')).toBeUndefined()
		expect(signedOAuthQuery('?sig=abc')).toBeUndefined()
	})

	it('survives the router intact once folded into oauth_query', () => {
		const raw = betterAuthSignedQuery()
		const shownInAddressBar = routerRoundTrip(foldSignedOAuthQuery(`?${raw}&redirect=%2Ftodos`))
		const search: Record<string, unknown> = defaultParseSearch(
			foldSignedOAuthQuery(shownInAddressBar),
		)
		expect(search.oauth_query).toBe(signedOAuthQuery(raw))
		expect(search.redirect).toBe('/todos')
		expect(new URLSearchParams(String(search.oauth_query)).get('state')).toBe('1e5')
	})

	it('would be broken by the router if left as separate params', () => {
		const rewritten = new URLSearchParams(routerRoundTrip(`?${betterAuthSignedQuery()}`))
		expect(rewritten.getAll('ba_param')).toHaveLength(1)
		expect(signedOAuthQuery(rewritten.toString())).not.toBe(
			signedOAuthQuery(betterAuthSignedQuery()),
		)
	})

	it('leaves a search without a signed query untouched', () => {
		expect(foldSignedOAuthQuery('?page=2&search=ana')).toBe('?page=2&search=ana')
	})
})
