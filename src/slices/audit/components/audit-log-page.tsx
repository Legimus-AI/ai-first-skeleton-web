import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { usePageInRange } from '@/hooks/use-page-in-range'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { FileText } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Pagination } from '@/ui/pagination'
import { useAuditEntries } from '../hooks/use-audit'
import { buildAuditColumns } from './audit-columns'

/** "Auditoría": what people and apps did in the organization, newest first (owner and admin). */
export function AuditLogPage() {
	const { page, limit } = useSearch({ from: '/_authed/settings/audit' })
	const navigate = useNavigate()
	const setParams = (updates: { page?: number; limit?: number }) =>
		void navigate({ to: '.', search: (prev) => ({ ...prev, ...updates }), replace: true })
	const { data, isLoading, error, refetch } = useAuditEntries({ page, limit })
	const columns = useMemo(() => buildAuditColumns(), [])
	const movingToLastPage = usePageInRange(data?.meta, (lastPage) => setParams({ page: lastPage }))

	if (error) return <InlineError error={error} onRetry={() => void refetch()} />

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Auditoría"
				description="Los cambios que hicieron las personas y las apps de tu organización."
			/>
			<div className="rounded-surface bg-card shadow-surface">
				<DataTable
					data={data?.data ?? []}
					columns={columns}
					getId={(entry) => entry.id}
					isLoading={isLoading || movingToLastPage}
					emptyMessage="Aún no hay actividad registrada."
					emptyIcon={<FileText className="h-6 w-6 text-muted-foreground" />}
				/>
			</div>
			{data?.meta && data.meta.total > 0 && (
				<Pagination
					meta={data.meta}
					onPageChange={(nextPage) => setParams({ page: nextPage })}
					onPerPageChange={(nextLimit) => setParams({ limit: nextLimit, page: 1 })}
				/>
			)}
		</FadeIn>
	)
}
