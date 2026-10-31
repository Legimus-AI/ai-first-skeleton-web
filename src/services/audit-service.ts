import { auditListResponseSchema, type ListQuery } from '@repo/shared'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk } from '@/services/api-error'

/** One page of the organization's audit log, newest first (owner and admin). */
export async function fetchAuditPage(params: Partial<ListQuery>, signal?: AbortSignal) {
	const auditResponse = await api.get('/api/v1/audit', params, signal)
	await throwIfNotOk(auditResponse)
	const json: unknown = await auditResponse.json()
	return safeParseResponse(auditListResponseSchema, json)
}
