import { type ErrorCode, errorResponseSchema } from '@repo/shared'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

interface ApiErrorDetails {
	/** HTTP status; 0 when no response arrived (network failure or timeout). */
	status?: number | undefined
	requestId?: string | undefined
	fields?: Record<string, string> | undefined
	/** Seconds the server asked to wait (`Retry-After` on a 429). */
	retryAfter?: number | undefined
	/** Request path, e.g. `/api/v1/todos`. */
	path?: string | undefined
}

export class ApiError extends Error {
	readonly status: number | undefined
	readonly requestId: string | undefined
	readonly fields: Record<string, string> | undefined
	readonly retryAfter: number | undefined
	readonly path: string | undefined

	constructor(
		message: string,
		public readonly code: ErrorCode,
		details: ApiErrorDetails = {},
	) {
		super(message)
		this.name = 'ApiError'
		this.status = details.status
		this.requestId = details.requestId
		this.fields = details.fields
		this.retryAfter = details.retryAfter
		this.path = details.path
	}
}

const CODE_BY_STATUS: Record<number, ErrorCode> = {
	400: 'VALIDATION_ERROR',
	401: 'UNAUTHORIZED',
	403: 'FORBIDDEN',
	404: 'NOT_FOUND',
	409: 'CONFLICT',
	422: 'VALIDATION_ERROR',
	429: 'RATE_LIMITED',
}

export async function parseApiError(res: Response): Promise<ApiError> {
	const retryAfter = Number(res.headers?.get('Retry-After')) || undefined
	const details = {
		status: res.status,
		retryAfter,
		path: res.url ? new URL(res.url).pathname : undefined,
	}
	const fallbackCode = CODE_BY_STATUS[res.status] ?? 'INTERNAL_ERROR'
	try {
		const json = await res.json()

		// AI-First Skeleton format: { error: { code, message, requestId?, fields? } }
		const parsed = errorResponseSchema.safeParse(json)
		if (parsed.success) {
			const { code, message, requestId, fields } = parsed.data.error
			return new ApiError(message, code, { ...details, requestId, fields })
		}

		// FastAPI/Pydantic 422 format: { detail: [{ loc, msg, type }] }
		if (Array.isArray(json.detail)) {
			const fields: Record<string, string> = {}
			const messages: string[] = []
			for (const err of json.detail) {
				const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : undefined
				const msg = typeof err.msg === 'string' ? err.msg : 'Invalid value'
				if (typeof field === 'string') fields[field] = msg
				messages.push(typeof field === 'string' ? `${field}: ${msg}` : msg)
			}
			return new ApiError(messages.join('. ') || 'Validation error', 'VALIDATION_ERROR', {
				...details,
				fields,
			})
		}

		// FastAPI string detail: { detail: "Not found" }
		if (typeof json.detail === 'string') {
			return new ApiError(json.detail, fallbackCode, details)
		}
	} catch {
		// Response body not parseable
	}
	return new ApiError(`Request failed with status ${res.status}`, fallbackCode, details)
}

export async function throwIfNotOk(res: Response): Promise<void> {
	if (!res.ok) {
		throw await parseApiError(res)
	}
}

/** Wrap Zod .parse() calls in hooks — logs raw error, throws user-friendly message. */
export function safeParseResponse<T>(schema: { parse: (data: unknown) => T }, json: unknown): T {
	try {
		return schema.parse(json)
	} catch (err) {
		if (import.meta.env.DEV) {
			console.error('[API] Response schema mismatch:', err)
		}
		throw new ApiError(
			'Data format error — the server response has changed. Please refresh the page.',
			'INTERNAL_ERROR',
		)
	}
}

// ─── What the user reads ────────────────────────────────────────────────────
// Backend messages stay English for API consumers; the UI shows only these.
// WHY: Partial, because each backend adds codes of its own (FastAPI's SCHEMA_MISMATCH).

const MESSAGE_BY_CODE: Partial<Record<ErrorCode, string>> = {
	VALIDATION_ERROR: 'Revisa los datos ingresados e inténtalo de nuevo.',
	NOT_FOUND: 'No encontramos lo que buscas. Puede que ya se haya eliminado.',
	UNAUTHORIZED: 'Tu sesión terminó. Inicia sesión de nuevo.',
	FORBIDDEN: 'No tienes permiso para hacer esto.',
	CONFLICT:
		'Este cambio no está permitido con los datos actuales. Actualiza la página y revisa antes de intentarlo de nuevo.',
	RATE_LIMITED: 'Hiciste demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
	INTERNAL_ERROR: 'Algo salió mal. Inténtalo de nuevo en unos minutos.',
}

const UNREACHABLE_STATUSES = new Set([0, 502, 503, 504])

/** True when no usable answer came back: offline, timed out, or the server is down. */
export function isServerUnreachable(error: unknown): boolean {
	return error instanceof ApiError && UNREACHABLE_STATUSES.has(error.status ?? -1)
}

function formatWait(seconds: number): string {
	if (seconds < 60) return `${seconds} segundo${seconds === 1 ? '' : 's'}`
	const minutes = Math.ceil(seconds / 60)
	return `${minutes} minuto${minutes === 1 ? '' : 's'}`
}

function fieldMessage(code: ErrorCode, field: string): string {
	if (code !== 'CONFLICT') return 'Revisa este campo.'
	return field === 'email' ? 'Ya existe una cuenta con este email.' : 'Este valor ya está en uso.'
}

/** Spanish, non-technical text for any thrown error. */
export function toUserMessage(error: unknown): string {
	if (!(error instanceof ApiError)) return 'Algo salió mal. Inténtalo de nuevo.'
	if (isServerUnreachable(error)) {
		return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
	}
	if (error.code === 'RATE_LIMITED' && error.retryAfter) {
		return `Hiciste demasiadas solicitudes. Espera ${formatWait(error.retryAfter)} e inténtalo de nuevo.`
	}
	const [firstField] = Object.keys(error.fields ?? {})
	if (error.code === 'CONFLICT' && firstField) return fieldMessage(error.code, firstField)
	return MESSAGE_BY_CODE[error.code] ?? 'Algo salió mal. Inténtalo de nuevo.'
}

/** Shows the server's per-field errors under their inputs; true when there were any. */
export function setFieldErrors<T extends FieldValues>(
	error: unknown,
	setError: UseFormSetError<T>,
): boolean {
	if (!(error instanceof ApiError) || !error.fields) return false
	for (const field of Object.keys(error.fields)) {
		setError(field as Path<T>, { message: fieldMessage(error.code, field) })
	}
	return Object.keys(error.fields).length > 0
}
