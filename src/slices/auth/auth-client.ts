/**
 * The web app's only Better Auth import (ADR 0022): one typed function per /api/auth endpoint the
 * app calls, so this file is also the list the API's allowlist must serve.
 * INV-7 named exception: Better Auth's client owns these requests (paths, bodies, its error shape),
 * so they skip `api.get/post`. The transport underneath is still the api-client's.
 */
import {
	oauthDeviceAuthorizationClient,
	oauthProviderClient,
} from '@better-auth/oauth-provider/client'
import type { MemberRole } from '@repo/shared'
import { createAuthClient } from 'better-auth/client'
import { organizationClient } from 'better-auth/client/plugins'
import { adminAc, memberAc, ownerAc } from 'better-auth/plugins/organization/access'
import { api } from '@/services/api-client'
import { OAUTH_QUERY_PARAM } from '@/utils/signed-oauth-query'
import { authApiErrorFrom } from './auth-error'

// WHY: not exported. Its inferred type is too large to emit (TS7056), and the functions below keep
// every endpoint the web uses in one reviewable place.
const client = createAuthClient({
	// Same origin: Vite proxies /api in development and nginx in production.
	baseURL: globalThis.location.origin,
	// WHY: a response that carries a `url` is followed by our code (`followAuthRedirect`), not by
	// Better Auth's redirect plugin racing the router's navigation.
	disableDefaultFetchPlugins: true,
	fetchOptions: {
		// Every call resolves to its data or throws an AuthApiError, like the api-client's hooks.
		throw: true,
		customFetchImpl: (input, init) =>
			api.send(input instanceof Request ? input.url : String(input), init),
		onError: ({ error, response }) => {
			throw authApiErrorFrom(error, response)
		},
	},
	plugins: [
		// The API's roles (owner, admin, user); they type `role` when inviting.
		organizationClient({ roles: { owner: ownerAc, admin: adminAc, user: memberAc } }),
		oauthProviderClient(),
		oauthDeviceAuthorizationClient(),
	],
})

/** Where Better Auth sends the browser next (an OAuth resume, Google), when it says so. */
export interface AuthRedirect {
	url: string | undefined
}

function redirectOf(response: unknown): AuthRedirect {
	const url =
		typeof response === 'object' && response !== null && 'url' in response
			? response.url
			: undefined
	return { url: typeof url === 'string' && url !== '' ? url : undefined }
}

/** Sends the browser where Better Auth points, unless the scheme would run code. */
export function followAuthRedirect(url: string): void {
	const scheme = new URL(url, globalThis.location.origin).protocol
	if (['javascript:', 'data:', 'vbscript:'].includes(scheme)) {
		throw new Error(`Refused to follow a ${scheme} redirect`)
	}
	globalThis.location.assign(url)
}

/** The Turnstile token header Better Auth's captcha plugin reads (sign-in, sign-up, reset). */
function captchaHeaders(captchaToken: string | null): Record<string, string> {
	return captchaToken ? { 'x-captcha-response': captchaToken } : {}
}

/** The signed OAuth query goes back in the body, as Better Auth's OAuth provider requires. */
function oauthBody(oauthQuery: string | undefined) {
	return oauthQuery ? { body: { [OAUTH_QUERY_PARAM]: oauthQuery } } : {}
}

interface Credentials {
	email: string
	password: string
	captchaToken: string | null
	/** Better Auth's signed OAuth query: the new session resumes that app's authorization. */
	oauthQuery: string | undefined
}

// --- Session ---

/** POST /sign-in/email. With an OAuth query it answers the URL that resumes the authorization. */
export async function signInWithEmail({ captchaToken, oauthQuery, ...credentials }: Credentials) {
	const response: unknown = await client.signIn.email({
		...credentials,
		fetchOptions: { headers: captchaHeaders(captchaToken), ...oauthBody(oauthQuery) },
	})
	return redirectOf(response)
}

/** POST /sign-up/email: creates the account and signs it in; resumes an OAuth query like sign-in. */
export async function signUpWithEmail({
	captchaToken,
	oauthQuery,
	...account
}: Credentials & { name: string }) {
	const response: unknown = await client.signUp.email({
		...account,
		fetchOptions: { headers: captchaHeaders(captchaToken), ...oauthBody(oauthQuery) },
	})
	return redirectOf(response)
}

/** POST /sign-in/social: answers Google's URL; Better Auth comes back to `callbackURL`. */
export async function signInWithGoogle(input: {
	callbackURL: string
	errorCallbackURL: string
	oauthQuery: string | undefined
}) {
	const response: unknown = await client.signIn.social({
		provider: 'google',
		callbackURL: input.callbackURL,
		errorCallbackURL: input.errorCallbackURL,
		fetchOptions: oauthBody(input.oauthQuery),
	})
	return redirectOf(response)
}

/** POST /sign-out */
export async function signOut(): Promise<void> {
	await client.signOut()
}

/** GET /get-session: who holds the session cookie, even without a team yet (an invited person). */
export async function getSession(): Promise<{ email: string; emailVerified: boolean } | null> {
	const session = await client.getSession()
	return session && { email: session.user.email, emailVerified: session.user.emailVerified }
}

/** POST /update-user */
export async function updateProfile(input: { name: string }): Promise<void> {
	await client.updateUser(input)
}

// --- Account emails ---

/** POST /request-password-reset: emails a reset link (if the account exists). */
export async function requestPasswordReset(input: {
	email: string
	captchaToken: string | null
}): Promise<void> {
	await client.requestPasswordReset({
		email: input.email,
		fetchOptions: { headers: captchaHeaders(input.captchaToken) },
	})
}

/** POST /reset-password: spends the emailed token; Better Auth ends every other session. */
export async function resetPassword(input: { token: string; password: string }): Promise<void> {
	await client.resetPassword({ token: input.token, newPassword: input.password })
}

/** GET /verify-email: spends the emailed token. */
export async function verifyEmail(token: string): Promise<void> {
	await client.verifyEmail({ query: { token } })
}

/** POST /send-verification-email */
export async function sendVerificationEmail(email: string): Promise<void> {
	await client.sendVerificationEmail({ email })
}

// --- Organization (team writes; the member list stays on REST) ---

/** POST /organization/invite-member */
export async function inviteMember(input: {
	email: string
	role: Exclude<MemberRole, 'owner'>
	organizationId: string
}): Promise<void> {
	await client.organization.inviteMember(input)
}

/** GET /organization/list-members, filtered to one user: their membership id, if any. */
export async function membershipIdOf(input: {
	organizationId: string
	userId: string
}): Promise<string | undefined> {
	const { members } = await client.organization.listMembers({
		query: {
			organizationId: input.organizationId,
			filterField: 'userId',
			filterValue: input.userId,
		},
	})
	return members[0]?.id
}

/** POST /organization/update-member-role (by membership id) */
export async function updateMemberRole(input: {
	memberId: string
	role: Exclude<MemberRole, 'owner'>
	organizationId: string
}): Promise<void> {
	await client.organization.updateMemberRole(input)
}

/** POST /organization/remove-member (by email). Better Auth refuses to remove the last owner. */
export async function removeMember(input: {
	email: string
	organizationId: string
}): Promise<void> {
	await client.organization.removeMember({
		memberIdOrEmail: input.email,
		organizationId: input.organizationId,
	})
}

/** An invitation as its recipient sees it. */
export interface InvitationView {
	email: string
	role: string
	organizationName: string
	inviterEmail: string
}

/** GET /organization/get-invitation: only for its recipient, with a confirmed email. */
export async function getInvitation(invitationId: string): Promise<InvitationView> {
	const invitation = await client.organization.getInvitation({ query: { id: invitationId } })
	return {
		email: invitation.email,
		role: invitation.role,
		organizationName: invitation.organizationName,
		inviterEmail: invitation.inviterEmail,
	}
}

/** POST /organization/accept-invitation */
export async function acceptInvitation(invitationId: string): Promise<void> {
	await client.organization.acceptInvitation({ invitationId })
}

/** POST /organization/reject-invitation */
export async function rejectInvitation(invitationId: string): Promise<void> {
	await client.organization.rejectInvitation({ invitationId })
}

// --- OAuth for MCP clients and the CLI ---

/** What a person sees of an OAuth client before letting it in. */
export interface OAuthClientView {
	name: string | undefined
	uri: string | undefined
}

/** GET /oauth2/public-client (needs a session) */
export async function getOAuthClient(clientId: string): Promise<OAuthClientView> {
	const found = await client.oauth2.publicClient({ query: { client_id: clientId } })
	return { name: found.client_name ?? undefined, uri: found.client_uri ?? undefined }
}

/** POST /oauth2/consent: answers the URL to send the browser to (the app, with a code or a denial). */
export async function answerOAuthConsent(input: { accept: boolean; oauthQuery: string }) {
	const response: unknown = await client.oauth2.consent({
		accept: input.accept,
		fetchOptions: oauthBody(input.oauthQuery),
	})
	return redirectOf(response)
}

/** A CLI login waiting at /device, as its approver sees it. */
export interface DeviceRequestView {
	status: string
	clientId: string | undefined
	scope: string | undefined
}

/** GET /device: while signed in, this also claims the code for the approver. */
export async function getDeviceRequest(userCode: string): Promise<DeviceRequestView> {
	const request = await client.device({ query: { user_code: userCode } })
	return {
		status: request.status,
		clientId: request.client_id ?? undefined,
		scope: request.scope ?? undefined,
	}
}

/** POST /device/approve or /device/deny */
export async function decideDeviceRequest(input: {
	userCode: string
	approve: boolean
}): Promise<void> {
	if (input.approve) await client.device.approve({ userCode: input.userCode })
	else await client.device.deny({ userCode: input.userCode })
}
