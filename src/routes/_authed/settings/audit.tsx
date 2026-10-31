import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/hooks/use-query-params'
import { ignoreCancelled } from '@/services/query-client'
import { AuditLogPage } from '@/slices/audit/components/audit-log-page'
import { auditQueryOptions } from '@/slices/audit/hooks/use-audit'

export const Route = createFileRoute('/_authed/settings/audit')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	loaderDeps: ({ search: { page, limit } }) => ({ page, limit }),
	loader: ({ context, deps }) =>
		context.queryClient
			.ensureQueryData({ ...auditQueryOptions(deps), revalidateIfStale: true })
			.catch(ignoreCancelled),
	component: AuditRoutePage,
})

function AuditRoutePage() {
	return <AuditLogPage />
}
