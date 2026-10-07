import { afterEach, describe, expect, it, vi } from 'vitest'
import { answerOAuthConsent, signInWithEmail } from '../auth-client'
import { AuthApiError } from '../auth-error'

const OAUTH_QUERY = 'client_id=claude&scope=*%3Aread&ba_param=client_id&ba_param=scope&sig=abc'
const CLIENT_CALLBACK = 'https://claude.ai/api/mcp/auth_callback?code=c0de&state=s'

/** Stubs the network with one answer and returns the spy, to read what was sent. */
function answerWith(response: Response) {
	const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => response)
	vi.stubGlobal('fetch', fetchSpy)
	return fetchSpy
}

function sentRequest(fetchSpy: ReturnType<typeof answerWith>) {
	const [url, init] = fetchSpy.mock.calls[0] ?? []
	return {
		path: new URL(String(url)).pathname,
		body: JSON.parse(String(init?.body)),
		headers: new Headers(init?.headers),
	}
}

describe('auth client', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('resumes an OAuth authorization: the signed query goes back, the returned url comes out', async () => {
		const fetchSpy = answerWith(Response.json({ redirect: true, url: CLIENT_CALLBACK }))
		const resumed = await signInWithEmail({
			email: 'ana@example.com',
			password: 'a-long-password',
			captchaToken: 'turnstile-token',
			oauthQuery: OAUTH_QUERY,
		})
		expect(resumed.url).toBe(CLIENT_CALLBACK)
		const request = sentRequest(fetchSpy)
		expect(request.path).toBe('/api/auth/sign-in/email')
		expect(request.body).toEqual({
			email: 'ana@example.com',
			password: 'a-long-password',
			oauth_query: OAUTH_QUERY,
		})
		expect(request.headers.get('x-captcha-response')).toBe('turnstile-token')
	})

	it('signs in without an OAuth query and without a captcha when there is none', async () => {
		const fetchSpy = answerWith(Response.json({ redirect: false, token: 't', user: {} }))
		const signedIn = await signInWithEmail({
			email: 'ana@example.com',
			password: 'a-long-password',
			captchaToken: null,
			oauthQuery: undefined,
		})
		expect(signedIn.url).toBeUndefined()
		const request = sentRequest(fetchSpy)
		expect(request.body).not.toHaveProperty('oauth_query')
		expect(request.headers.has('x-captcha-response')).toBe(false)
	})

	it('answers the consent with the signed query and returns where to go', async () => {
		const fetchSpy = answerWith(Response.json({ redirect: true, url: CLIENT_CALLBACK }))
		const answered = await answerOAuthConsent({ accept: false, oauthQuery: OAUTH_QUERY })
		expect(answered.url).toBe(CLIENT_CALLBACK)
		const request = sentRequest(fetchSpy)
		expect(request.path).toBe('/api/auth/oauth2/consent')
		expect(request.body).toEqual({ accept: false, oauth_query: OAUTH_QUERY })
	})

	it('throws an AuthApiError with the lockout wait from Retry-After', async () => {
		answerWith(
			Response.json(
				{ message: 'Too many login attempts. Try again later.' },
				{ status: 429, headers: { 'Retry-After': '600' } },
			),
		)
		const attempt = signInWithEmail({
			email: 'ana@example.com',
			password: 'wrong',
			captchaToken: null,
			oauthQuery: undefined,
		})
		await expect(attempt).rejects.toBeInstanceOf(AuthApiError)
		await expect(attempt).rejects.toMatchObject({ status: 429, retryAfter: 600 })
	})
})
