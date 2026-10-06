import { describe, expect, it, vi } from 'vitest'
import { ApiError, parseApiError, setFieldErrors, toUserMessage } from '@/services/api-error'

describe('toUserMessage', () => {
	it('says the server is unreachable for no response and for gateway errors', () => {
		for (const status of [0, 502, 503, 504]) {
			const error = new ApiError('Request failed', 'INTERNAL_ERROR', {
				status,
			})
			expect(toUserMessage(error)).toMatch(/^No pudimos conectar con el servidor/)
		}
	})

	it('tells how long to wait on a 429 with Retry-After', () => {
		const seconds = new ApiError('Too many', 'RATE_LIMITED', {
			status: 429,
			retryAfter: 30,
		})
		const minutes = new ApiError('Too many', 'RATE_LIMITED', {
			status: 429,
			retryAfter: 90,
		})
		expect(toUserMessage(seconds)).toContain('Espera 30 segundos')
		expect(toUserMessage(minutes)).toContain('Espera 2 minutos')
	})

	it('names the taken email on a CONFLICT with fields.email', () => {
		const error = new ApiError('Email already registered', 'CONFLICT', {
			status: 409,
			fields: { email: 'Email already registered' },
		})
		expect(toUserMessage(error)).toBe('Ya existe una cuenta con este email.')
	})

	it('never shows the backend English message', () => {
		const error = new ApiError('duplicate key value violates unique constraint', 'INTERNAL_ERROR', {
			status: 500,
		})
		expect(toUserMessage(error)).not.toContain('duplicate key')
		expect(toUserMessage(new Error('Cannot read properties of undefined'))).toBe(
			'Algo salió mal. Inténtalo de nuevo.',
		)
	})
})

describe('parseApiError', () => {
	it('keeps status, Retry-After, path and requestId', async () => {
		const res = new Response(
			JSON.stringify({
				error: {
					code: 'RATE_LIMITED',
					message: 'Too many requests',
					requestId: '550e8400-e29b-41d4-a716-446655440000',
				},
			}),
			{ status: 429, headers: { 'Retry-After': '12' } },
		)
		Object.defineProperty(res, 'url', {
			value: 'http://localhost/api/v1/todos?page=1',
		})

		const error = await parseApiError(res)

		expect(error).toMatchObject({
			status: 429,
			code: 'RATE_LIMITED',
			retryAfter: 12,
			path: '/api/v1/todos',
			requestId: '550e8400-e29b-41d4-a716-446655440000',
		})
	})
})

describe('setFieldErrors', () => {
	it('puts a Spanish message under each field the server rejected', () => {
		const setError = vi.fn()
		const error = new ApiError('Email already registered', 'CONFLICT', {
			status: 409,
			fields: { email: 'Email already registered' },
		})

		expect(setFieldErrors(error, setError)).toBe(true)
		expect(setError).toHaveBeenCalledWith('email', {
			message: 'Ya existe una cuenta con este email.',
		})
	})
})
