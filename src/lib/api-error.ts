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
		const parsed = errorResponseSchema.safeParse(json)
		if (parsed.success) {
			const { code, message, requestId, fields } = parsed.data.error
			return new ApiError(message, code, requestId, fields)
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
