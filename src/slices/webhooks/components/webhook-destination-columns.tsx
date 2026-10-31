import type { WebhookDestination } from '@repo/shared'
import { formatDate } from '@/services/date-format-service'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { Trash } from '@/ui/icons'
import { eventTypeLabel } from '../event-labels'

export function buildWebhookDestinationColumns(
	onDelete: (id: string) => void,
): Column<WebhookDestination>[] {
	return [
		{
			key: 'url',
			label: 'Destino',
			render: (destination) => (
				<div className="space-y-1">
					<p className="font-mono text-sm text-foreground break-all">{destination.url}</p>
					{destination.disabledAt && (
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<Badge variant="secondary">Desactivado</Badge>
							{formatDate(destination.disabledAt)}
						</div>
					)}
				</div>
			),
		},
		{
			key: 'eventTypes',
			label: 'Eventos',
			className: 'hidden sm:table-cell',
			render: (destination) => (
				<span className="text-sm text-muted-foreground">
					{destination.eventTypes.map(eventTypeLabel).join(', ')}
				</span>
			),
		},
		{
			key: 'createdAt',
			label: 'Creado',
			className: 'hidden md:table-cell',
			render: (destination) => (
				<span className="text-sm text-muted-foreground">{formatDate(destination.createdAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-12 text-right',
			render: (destination) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-destructive"
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onDelete(destination.id)
					}}
					aria-label={`Eliminar el destino ${destination.url}`}
				>
					<Trash className="h-4 w-4" />
				</Button>
			),
		},
	]
}
