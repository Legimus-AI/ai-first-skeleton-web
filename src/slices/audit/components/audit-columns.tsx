import type { AuditEntryView } from '@repo/shared'
import { formatDateTime } from '@/services/date-format-service'
import { Badge } from '@/ui/badge'
import type { Column } from '@/ui/data-table'

/** The audit table: when, what ran, who ran it and how it ended. */
export function buildAuditColumns(): Column<AuditEntryView>[] {
	return [
		{
			key: 'createdAt',
			label: 'Fecha',
			className: 'w-44',
			render: (entry) => (
				<span className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
			),
		},
		{
			key: 'operationId',
			label: 'Acción',
			render: (entry) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-all">{entry.operationId}</p>
					<p className="text-xs text-muted-foreground break-all">
						{entry.method} {entry.path}
					</p>
				</div>
			),
		},
		{
			key: 'actorType',
			label: 'Quién',
			className: 'hidden sm:table-cell w-32',
			render: (entry) => <Badge variant="secondary">{entry.actorType}</Badge>,
		},
		{
			key: 'status',
			label: 'Resultado',
			className: 'w-24',
			render: (entry) => (
				<Badge variant={entry.status < 400 ? 'success' : 'destructive'}>{entry.status}</Badge>
			),
		},
	]
}
