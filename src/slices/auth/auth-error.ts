/** Better Auth failures: the error the auth client throws, and what the user reads for each one. */
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@repo/shared'
import { ApiError, codeForStatus, formatWait, toUserMessage } from '@/services/api-error'
import { nonEmptyText } from '@/utils/non-empty-text'

interface AuthErrorDetails {
	status: number
	retryAfter?: number | undefined
	path?: string | undefined
	requestId?: string | undefined
}

/** A failed Better Auth call. `authCode` is its code (`INVALID_EMAIL_OR_PASSWORD`) or OAuth error. */
export class AuthApiError extends ApiError {
	readonly authCode: string | undefined

	constructor(message: string, authCode: string | undefined, details: AuthErrorDetails) {
		super(message, codeForStatus(details.status), details)
		this.name = 'AuthApiError'
		this.authCode = authCode
	}
}

/** Builds the error from a failed response: `{ code, message }`, or `{ error, error_description }` (OAuth). */
export function authApiErrorFrom(body: unknown, response: Response): AuthApiError {
	const fields: Record<string, unknown> =
		typeof body === 'object' && body !== null ? { ...body } : {}
	const message = nonEmptyText(fields.message) ?? nonEmptyText(fields.error_description)
	// Some Better Auth errors carry only a message ("Invitation not found!"): that is their code.
	const messageAsCode = message
		?.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '_')
		.replace(/^_|_$/g, '')
	return new AuthApiError(
		message ?? `Request failed with status ${response.status}`,
		nonEmptyText(fields.code) ?? nonEmptyText(fields.error) ?? messageAsCode,
		{
			status: response.status,
			retryAfter: Number(response.headers.get('Retry-After')) || undefined,
			path: response.url ? new URL(response.url).pathname : undefined,
			requestId: response.requestId,
		},
	)
}

const LINK_EXPIRED = 'El enlace no es válido o ya venció. Pide uno nuevo.'
const NOT_A_PERSON = 'No pudimos verificar que eres una persona. Inténtalo de nuevo.'
const LAST_OWNER =
	'El equipo necesita al menos un propietario: no puedes quitar ni cambiar al último.'
const VERIFY_EMAIL_FIRST =
	'Primero confirma tu email con el enlace que te enviamos y luego vuelve a esta invitación.'
const EMAIL_TAKEN = 'Ya existe una cuenta con este email.'
const PASSWORD_LENGTH = `Usa entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`

// Backend messages stay English for API consumers; the UI shows only these.
const MESSAGE_BY_AUTH_CODE: Readonly<Record<string, string>> = {
	INVALID_EMAIL_OR_PASSWORD: 'Email o contraseña incorrectos.',
	USER_ALREADY_EXISTS: EMAIL_TAKEN,
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: EMAIL_TAKEN,
	PASSWORD_COMPROMISED: 'Esta contraseña apareció en una filtración de datos. Elige otra.',
	PASSWORD_TOO_SHORT: PASSWORD_LENGTH,
	PASSWORD_TOO_LONG: PASSWORD_LENGTH,
	INVALID_TOKEN: LINK_EXPIRED,
	TOKEN_EXPIRED: LINK_EXPIRED,
	EMAIL_NOT_VERIFIED: 'Confirma tu email antes de continuar: revisa tu bandeja de entrada.',
	EMAIL_ALREADY_VERIFIED: 'Tu email ya está confirmado.',
	MISSING_RESPONSE: NOT_A_PERSON,
	VERIFICATION_FAILED: NOT_A_PERSON,
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: LAST_OWNER,
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: LAST_OWNER,
	USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: 'Esa persona ya es parte del equipo.',
	USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: 'Esa persona ya tiene una invitación pendiente.',
	MEMBER_NOT_FOUND: 'Esa persona ya no es parte del equipo. Actualiza la página.',
	INVITATION_NOT_FOUND:
		'La invitación no existe o ya venció. Pide a quien te invitó que te envíe otra.',
	INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION:
		'Quien te invitó ya no es parte del equipo. Pide otra invitación.',
	YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION:
		'Esta invitación es para otro email. Inicia sesión con el email que la recibió.',
	EMAIL_VERIFICATION_REQUIRED_FOR_INVITATION: VERIFY_EMAIL_FIRST,
	EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION: VERIFY_EMAIL_FIRST,
	invalid_signature:
		'Esta solicitud de acceso no es válida o ya venció. Vuelve a conectar la app desde el inicio.',
}

/**
 * Spanish, non-technical text for a failed auth call. `messages` overrides codes whose meaning
 * depends on the page (an OAuth `invalid_request` on the device page is a mistyped code).
 */
export function authErrorMessage(
	error: unknown,
	messages: Readonly<Record<string, string>> = {},
): string {
	if (!(error instanceof AuthApiError)) return toUserMessage(error)
	if (error.status === 429) {
		return error.retryAfter
			? `Demasiados intentos. Por seguridad, espera ${formatWait(error.retryAfter)} y vuelve a intentarlo.`
			: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.'
	}
	const code = error.authCode ?? ''
	const known = messages[code] ?? MESSAGE_BY_AUTH_CODE[code]
	if (known) return known
	if (code.startsWith('YOU_ARE_NOT_ALLOWED')) return 'No tienes permiso para hacer esto.'
	return toUserMessage(error)
}

const FIELD_BY_AUTH_CODE: Readonly<Record<string, 'email' | 'password'>> = {
	USER_ALREADY_EXISTS: 'email',
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'email',
	USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: 'email',
	USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: 'email',
	PASSWORD_COMPROMISED: 'password',
	PASSWORD_TOO_SHORT: 'password',
	PASSWORD_TOO_LONG: 'password',
}

/** The form field a failure belongs under (a taken or invited email, a leaked password), if any. */
export function authErrorField(error: unknown): 'email' | 'password' | undefined {
	return error instanceof AuthApiError ? FIELD_BY_AUTH_CODE[error.authCode ?? ''] : undefined
}
