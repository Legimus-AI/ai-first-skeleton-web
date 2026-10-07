/** The app's only Better Auth import (ADR 0022): one function per /api/auth endpoint it calls. */
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
import { redirectOf } from './auth-redirect'

// WHY: not exported. Its inferred type is too large to emit (TS7056), and the functions below keep
// every endpoint the web uses in one reviewable place.
const betterAuthClient = createAuthClient({
	// Same origin: Vite proxies /api in development and nginx in production.
	baseURL: globalThis.location.origin,
	// WHY: a response that carries a `url` is followed by our code (`followAuthRedirect`), not by
	// Better Auth's redirect plugin racing the router's navigation.
	disableDefaultFetchPlugins: true,
	fetchOptions: {
		// Every call resolves to its data or throws an AuthApiError, like the api-client's hooks.
		throw: true,
		// WHY: INV-7 named exception. Better Auth's client owns these requests (paths, bodies, its error
		// shape), so they skip `api.get/post`; the transport underneath is still the api-client's.
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
	const response: unknown = await betterAuthClient.signIn.email({
		...credentials,
		fetchOptions: { headers: captchaHeaders(captchaToken), ...oauthBody(oauthQuery) },
	})
	return redirectOf(response)
}

/**
 * POST /sign-up/email: creates the account and signs it in; resumes an OAuth query like sign-in.
 * `callbackURL` is the page the email confirmation link goes on to.
 */
export async function signUpWithEmail({
	captchaToken,
	oauthQuery,
	...account
}: Credentials & { name: string; callbackURL: string | undefined }) {
	const response: unknown = await betterAuthClient.signUp.email({
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
	const response: unknown = await betterAuthClient.signIn.social({
		provider: 'google',
		callbackURL: input.callbackURL,
		errorCallbackURL: input.errorCallbackURL,
		fetchOptions: oauthBody(input.oauthQuery),
	})
	return redirectOf(response)
}

/** POST /sign-out */
export async function signOut(): Promise<void> {
	await betterAuthClient.signOut()
}

/** GET /get-session: who holds the session cookie, even without a team yet (an invited person). */
export async function getSession(): Promise<{ email: string } | null> {
	const session = await betterAuthClient.getSession()
	return session && { email: session.user.email }
}

/** POST /update-user */
export async function updateProfile(input: { name: string }): Promise<void> {
	await betterAuthClient.updateUser(input)
}

// --- Account emails ---

/** POST /request-password-reset: emails a reset link (if the account exists). */
export async function requestPasswordReset(input: {
	email: string
	captchaToken: string | null
}): Promise<void> {
	await betterAuthClient.requestPasswordReset({
		email: input.email,
		fetchOptions: { headers: captchaHeaders(input.captchaToken) },
	})
}

/** POST /reset-password: spends the emailed token; Better Auth ends every other session. */
export async function resetPassword(input: { token: string; password: string }): Promise<void> {
	await betterAuthClient.resetPassword({ token: input.token, newPassword: input.password })
}

/** GET /verify-email: spends the emailed token. */
export async function verifyEmail(token: string): Promise<void> {
	await betterAuthClient.verifyEmail({ query: { token } })
}

/** POST /send-verification-email; the link goes on to `callbackURL` once confirmed. */
export async function sendVerificationEmail(email: string, callbackURL?: string): Promise<void> {
	await betterAuthClient.sendVerificationEmail({ email, callbackURL })
}

// --- Organization (team writes; the member list stays on REST) ---

/** POST /organization/invite-member */
export async function inviteMember(input: {
	email: string
	role: Exclude<MemberRole, 'owner'>
	organizationId: string
}): Promise<void> {
	await betterAuthClient.organization.inviteMember(input)
}

/** GET /organization/list-members, filtered to one user: their membership id, if any. */
export async function membershipIdOf(input: {
	organizationId: string
	userId: string
}): Promise<string | undefined> {
	const { members } = await betterAuthClient.organization.listMembers({
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
	await betterAuthClient.organization.updateMemberRole(input)
}

/** POST /organization/remove-member (by email). Better Auth refuses to remove the last owner. */
export async function removeMember(input: {
	email: string
	organizationId: string
}): Promise<void> {
	await betterAuthClient.organization.removeMember({
		memberIdOrEmail: input.email,
		organizationId: input.organizationId,
	})
}

/** POST /organization/cancel-invitation: the emailed link stops working. */
export async function cancelInvitation(invitationId: string): Promise<void> {
	await betterAuthClient.organization.cancelInvitation({ invitationId })
}

/** An invitation as its recipient sees it. */
export interface InvitationView {
	role: string
	organizationName: string
	inviterEmail: string
}

/** GET /organization/get-invitation: only for its recipient, with a confirmed email. */
export async function getInvitation(invitationId: string): Promise<InvitationView> {
	const invitation = await betterAuthClient.organization.getInvitation({
		query: { id: invitationId },
	})
	return {
		role: invitation.role,
		organizationName: invitation.organizationName,
		inviterEmail: invitation.inviterEmail,
	}
}

/** POST /organization/accept-invitation */
export async function acceptInvitation(invitationId: string): Promise<void> {
	await betterAuthClient.organization.acceptInvitation({ invitationId })
}

/** POST /organization/reject-invitation */
export async function rejectInvitation(invitationId: string): Promise<void> {
	await betterAuthClient.organization.rejectInvitation({ invitationId })
}

// --- OAuth for MCP clients and the CLI ---

/** What a person sees of an OAuth client before letting it in. */
export interface OAuthClientView {
	name: string | undefined
}

/** GET /oauth2/public-client (needs a session) */
export async function getOAuthClient(clientId: string): Promise<OAuthClientView> {
	const publicClient = await betterAuthClient.oauth2.publicClient({
		query: { client_id: clientId },
	})
	return { name: publicClient.client_name ?? undefined }
}

/** POST /oauth2/consent: answers the URL to send the browser to (the app, with a code or a denial). */
export async function answerOAuthConsent(input: { accept: boolean; oauthQuery: string }) {
	const response: unknown = await betterAuthClient.oauth2.consent({
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
	const deviceRequest = await betterAuthClient.device({ query: { user_code: userCode } })
	return {
		status: deviceRequest.status,
		clientId: deviceRequest.client_id ?? undefined,
		scope: deviceRequest.scope ?? undefined,
	}
}

/** POST /device/approve or /device/deny */
export async function decideDeviceRequest(input: {
	userCode: string
	approve: boolean
}): Promise<void> {
	if (input.approve) await betterAuthClient.device.approve({ userCode: input.userCode })
	else await betterAuthClient.device.deny({ userCode: input.userCode })
}
