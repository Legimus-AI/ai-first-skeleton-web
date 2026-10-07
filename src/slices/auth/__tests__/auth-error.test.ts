import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services/api-error'
import { authApiErrorFrom, authErrorField, authErrorMessage } from '../auth-error'

/** The error the auth client throws for a failed Better Auth response. */
function failed(status: number, body: unknown, headers: Record<string, string> = {}) {
	return authApiErrorFrom(body, new Response(null, { status, headers }))
}

describe('Better Auth error messages', () => {
	it('maps a Better Auth code to Spanish', () => {
		const wrongPassword = failed(401, {
			code: 'INVALID_EMAIL_OR_PASSWORD',
			message: 'Invalid email or password',
		})
		expect(authErrorMessage(wrongPassword)).toBe('Email o contraseña incorrectos.')
	})

	it('tells how long to wait after the login lockout, from Retry-After', () => {
		const lockedOut = failed(
			429,
			{ message: 'Too many login attempts. Try again later.' },
			{ 'Retry-After': '900' },
		)
		expect(lockedOut.retryAfter).toBe(900)
		expect(authErrorMessage(lockedOut)).toBe(
			'Demasiados intentos. Por seguridad, espera 15 minutos y vuelve a intentarlo.',
		)
		// The API's per-IP limiter answers in the skeleton's shape; the status decides.
		const limited = failed(429, { error: { code: 'RATE_LIMITED', message: 'Too many' } })
		expect(authErrorMessage(limited)).toBe(
			'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
		)
	})

	it('reads the OAuth error shape and lets a page say what it means there', () => {
		const typo = failed(400, {
			error: 'invalid_request',
			error_description: 'Invalid user code',
		})
		expect(typo.authCode).toBe('invalid_request')
		expect(authErrorMessage(typo, { invalid_request: 'Ese código no es válido.' })).toBe(
			'Ese código no es válido.',
		)
	})

	it('derives the code of an error that carries only a message', () => {
		const gone = failed(400, { message: 'Invitation not found!' })
		expect(gone.authCode).toBe('INVITATION_NOT_FOUND')
		expect(authErrorMessage(gone)).toContain('La invitación no existe o ya venció')
	})

	it('says the last owner stays', () => {
		const lastOwner = failed(400, {
			code: 'YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER',
			message: 'You cannot leave the organization as the only owner',
		})
		expect(authErrorMessage(lastOwner)).toContain('al menos un propietario')
	})

	it('falls back to the status message for an unknown code, and stays an ApiError', () => {
		const unknown = failed(403, { code: 'SOMETHING_NEW', message: 'New' })
		expect(unknown).toBeInstanceOf(ApiError)
		expect(unknown.code).toBe('FORBIDDEN')
		expect(authErrorMessage(unknown)).toBe('No tienes permiso para hacer esto.')
		const offline = new ApiError('offline', 'INTERNAL_ERROR', { status: 0 })
		expect(authErrorMessage(offline)).toContain('No pudimos conectar con el servidor')
	})

	it('puts a taken email or a leaked password under its field', () => {
		expect(authErrorField(failed(422, { code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' }))).toBe(
			'email',
		)
		expect(authErrorField(failed(400, { code: 'PASSWORD_COMPROMISED' }))).toBe('password')
		expect(authErrorField(failed(401, { code: 'INVALID_EMAIL_OR_PASSWORD' }))).toBeUndefined()
	})
})
