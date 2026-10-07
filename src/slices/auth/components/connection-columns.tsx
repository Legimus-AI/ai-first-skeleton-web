import type { OAuthConnection } from '@repo/shared'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { Trash } from '@/ui/icons'
import { formatDate, formatRelative } from '@/utils/format-date'
import { describeScope } from '../oauth-request'

/** The connected apps table: the app, its permissions, its dates and the disconnect action. */
export function buildConnectionColumns(
	onRevoke: (connection: OAuthConnection) => void,
): Column<OAuthConnection>[] {
	return [
		{
			key: 'clientName',
			label: 'App',
			render: (connection) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-words">{connection.clientName}</p>
					<p className="text-xs text-muted-foreground break-all">{connection.clientId}</p>
				</div>
			),
		},
		{
			key: 'scopes',
			label: 'Permisos',
			className: 'hidden sm:table-cell',
			render: (connection) => (
				<span className="text-sm text-muted-foreground">
					{connection.scopes.map((scope) => describeScope(scope).label).join(', ')}
				</span>
			),
		},
		{
			key: 'createdAt',
			label: 'Conectada',
			className: 'hidden md:table-cell',
			render: (connection) => (
				<span className="text-sm text-muted-foreground">
					{connection.createdAt ? formatDate(connection.createdAt) : '—'}
				</span>
			),
		},
		{
			key: 'lastUsedAt',
			label: 'Último uso',
			className: 'hidden md:table-cell',
			render: (connection) => (
				<span className="text-sm text-muted-foreground">
					{connection.lastUsedAt ? formatRelative(connection.lastUsedAt) : 'Nunca'}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-12 text-right',
			render: (connection) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-destructive"
					type="button"
					onClick={(event) => {
						event.stopPropagation()
						onRevoke(connection)
					}}
					aria-label={`Desconectar "${connection.clientName}"`}
				>
					<Trash className="h-4 w-4" />
				</Button>
			),
		},
	]
}
