import type { ListQuery } from '@repo/shared'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAuditPage } from '@/services/audit-service'

export const auditQueryOptions = (params?: Partial<ListQuery>) =>
	queryOptions({
		queryKey: ['audit', params],
		queryFn: ({ signal }) => fetchAuditPage(params ?? {}, signal),
		placeholderData: keepPreviousData,
	})

/** One page of audit entries, newest first, paged by the server. */
export function useAuditEntries(params?: Partial<ListQuery>) {
	return useQuery(auditQueryOptions(params))
}
