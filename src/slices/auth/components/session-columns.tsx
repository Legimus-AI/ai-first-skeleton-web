import { formatDateTime } from '@/services/date-format-service'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { X } from '@/ui/icons'
import type { SessionView } from '../auth-client'

/** The sessions table: the device, when it signed in, and the close action (not for this one). */
export function buildSessionColumns(
	onRevoke: (session: SessionView) => void,
): Column<SessionView>[] {
	return [
		{
			key: 'device',
			label: 'Dispositivo',
			render: (session) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-words">
						{session.userAgent ?? 'Dispositivo desconocido'}
					</p>
					<p className="text-xs text-muted-foreground">{session.ipAddress ?? 'IP desconocida'}</p>
				</div>
			),
		},
		{
			key: 'createdAt',
			label: 'Inició sesión',
			className: 'hidden sm:table-cell w-44',
			render: (session) => (
				<span className="text-sm text-muted-foreground">{formatDateTime(session.createdAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-28 text-right',
			render: (session) =>
				session.isCurrent ? (
					<Badge variant="success">Esta sesión</Badge>
				) : (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive"
						type="button"
						onClick={() => onRevoke(session)}
						aria-label={`Cerrar la sesión de ${session.userAgent ?? 'un dispositivo desconocido'}`}
					>
						<X className="h-4 w-4" />
					</Button>
				),
		},
	]
}
