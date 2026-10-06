import type { WebhookEvent } from '@repo/shared'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { RefreshCw } from '@/ui/icons'
import { formatDateTime } from '@/utils/format-date'
import { type DeliveryState, summarizeDeliveries } from '../delivery-summary'
import { eventTypeLabel } from '../event-labels'

const STATE_BADGES: Record<
	DeliveryState,
	{ label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }
> = {
	delivered: { label: 'Entregado', variant: 'success' },
	pending: { label: 'Pendiente', variant: 'warning' },
	failed: { label: 'Fallido', variant: 'destructive' },
	// No send left: nobody was subscribed, or the destination was deleted along with its sends.
	none: { label: 'Sin envíos', variant: 'secondary' },
}

interface WebhookEventColumnsOptions {
	onResend: (eventId: string) => void
	/** The event whose resend is in flight, if any. */
	resendingId: string | undefined
}

export function buildWebhookEventColumns({
	onResend,
	resendingId,
}: WebhookEventColumnsOptions): Column<WebhookEvent>[] {
	return [
		{
			key: 'type',
			label: 'Evento',
			render: (event) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">{eventTypeLabel(event.type)}</p>
					{/* The date column shows from md up; below it the date tells similar rows apart. */}
					<p className="text-xs text-muted-foreground md:hidden">
						{formatDateTime(event.createdAt)}
					</p>
					<p className="hidden font-mono text-xs text-muted-foreground break-all sm:block">
						{event.resourceId}
					</p>
				</div>
			),
		},
		{
			key: 'createdAt',
			label: 'Fecha',
			className: 'hidden md:table-cell',
			render: (event) => (
				<span className="text-sm text-muted-foreground">{formatDateTime(event.createdAt)}</span>
			),
		},
		{
			key: 'state',
			label: 'Estado',
			render: (event) => {
				const { state, attempts, lastError } = summarizeDeliveries(event.deliveries)
				const badge = STATE_BADGES[state]
				return (
					<div className="min-w-0 max-w-56 space-y-1">
						<Badge variant={badge.variant}>{badge.label}</Badge>
						{/* Mobile cards hide the attempts column, so the count rides with the state. */}
						<p className="text-xs text-muted-foreground sm:hidden">
							{attempts} {attempts === 1 ? 'intento' : 'intentos'}
						</p>
						{lastError && (
							<p
								className="line-clamp-2 text-xs text-muted-foreground break-words"
								title={lastError}
							>
								{lastError}
							</p>
						)}
					</div>
				)
			},
		},
		{
			key: 'attempts',
			label: 'Intentos',
			className: 'hidden sm:table-cell',
			render: (event) => (
				<span className="text-sm tabular-nums text-muted-foreground">
					{summarizeDeliveries(event.deliveries).attempts}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-28 text-right',
			render: (event) => (
				<Button
					variant="ghost"
					size="sm"
					type="button"
					loading={resendingId === event.id}
					onClick={(e) => {
						e.stopPropagation()
						onResend(event.id)
					}}
					aria-label={`Reenviar el evento ${eventTypeLabel(event.type)} de ${event.resourceId}`}
				>
					<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
					Reenviar
				</Button>
			),
		},
	]
}
