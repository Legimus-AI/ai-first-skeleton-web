import { type ErrorCode, errorResponseSchema } from '@repo/shared'

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly code: ErrorCode,
		public readonly requestId?: string,
		public readonly fields?: Record<string, string>,
	) {
		super(message)
		this.name = 'ApiError'
	}
}

export async function parseApiError(res: Response): Promise<ApiError> {
	try {
		const json = await res.json()

		// AI-First Skeleton format: { error: { code, message, requestId?, fields? } }
		const parsed = errorResponseSchema.safeParse(json)
		if (parsed.success) {
			const { code, message, requestId, fields } = parsed.data.error
			return new ApiError(message, code, requestId, fields)
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
			return new ApiError(
				messages.join('. ') || 'Validation error',
				'VALIDATION_ERROR',
				undefined,
				fields,
			)
		}

		// FastAPI string detail: { detail: "Not found" }
		if (typeof json.detail === 'string') {
			return new ApiError(json.detail, res.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR')
		}
	} catch {
		// Response body not parseable
	}
	return new ApiError(`Request failed with status ${res.status}`, 'INTERNAL_ERROR')
}

export async function throwIfNotOk(res: Response): Promise<void> {
	if (!res.ok) {
		throw await parseApiError(res)
	}
}
