import { describe, expect, it } from 'vitest'
import { oauthRequestOf, redirectTargetOf } from '../oauth-request'

describe('loopback warning', () => {
	it.each([
		'http://localhost:6274/callback',
		'http://127.0.0.1:53682/callback',
		'http://127.4.5.6/cb',
		'http://[::1]:8080/cb',
		'http://app.localhost/cb',
	])('warns for %s', (redirectUri) => {
		expect(redirectTargetOf(redirectUri)?.isLoopback).toBe(true)
	})

	it.each([
		'https://claude.ai/api/mcp/auth_callback',
		// Look-alikes: not this computer.
		'https://localhost.evil.example/cb',
		'https://127.0.0.1.evil.example/cb',
		'http://10.0.0.5/cb',
	])('does not warn for %s', (redirectUri) => {
		expect(redirectTargetOf(redirectUri)?.isLoopback).toBe(false)
	})

	it('names the host the access goes to, or the app scheme', () => {
		expect(redirectTargetOf('https://claude.ai/api/mcp/auth_callback')?.host).toBe('claude.ai')
		expect(redirectTargetOf('http://127.0.0.1:53682/callback')?.host).toBe('127.0.0.1:53682')
		expect(redirectTargetOf('com.example.app:/oauth')?.host).toBe('com.example.app')
		expect(redirectTargetOf('not a url')).toBeUndefined()
	})
})

describe('OAuth request', () => {
	it('reads the client, redirect and scopes from the signed query', () => {
		const query = new URLSearchParams({
			client_id: 'claude-code',
			redirect_uri: 'http://127.0.0.1:53682/callback',
			scope: '*:read *:write offline_access',
			sig: 'x',
		}).toString()
		expect(oauthRequestOf(query)).toEqual({
			clientId: 'claude-code',
			redirectUri: 'http://127.0.0.1:53682/callback',
			scopes: ['*:read', '*:write', 'offline_access'],
		})
	})
})
