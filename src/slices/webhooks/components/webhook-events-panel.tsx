import { useMemo } from 'react'
import { Button } from '@/ui/button'
import { DataTable } from '@/ui/data-table'
import { Bell } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { useResendWebhookEvent, useWebhookEvents } from '../hooks/use-webhooks'
import { buildWebhookEventColumns } from './webhook-event-columns'

/** Sent events, newest first, with their delivery state and a resend per event. */
export function WebhookEventsPanel({ resendDisabled }: { resendDisabled: boolean }) {
	const { data, isLoading, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useWebhookEvents()
	const resendEvent = useResendWebhookEvent()
	const resendingId = resendEvent.isPending ? resendEvent.variables : undefined

	const events = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])
	const columns = useMemo(
		() =>
			buildWebhookEventColumns({
				onResend: (id) => resendEvent.mutate(id),
				resendingId,
				resendDisabled,
			}),
		[resendEvent.mutate, resendingId, resendDisabled],
	)

	return (
		<section className="space-y-3" aria-labelledby="webhook-events-title">
			<div className="space-y-1">
				<h2 id="webhook-events-title" className="text-base font-semibold text-foreground">
					Eventos enviados
				</h2>
				<p className="text-sm text-muted-foreground">
					Los más recientes primero. Un envío fallido se reintenta solo; Reenviar lo manda otra vez
					ahora.
				</p>
			</div>
			{/* A failed background refresh keeps the rows already loaded. */}
			{error && !data ? (
				<InlineError error={error} onRetry={() => void refetch()} />
			) : (
				<div className="rounded-surface bg-card shadow-surface">
					<DataTable
						data={events}
						columns={columns}
						getId={(event) => event.id}
						isLoading={isLoading}
						emptyMessage="Aún no hay eventos. Aparecen aquí cuando se crea, cambia o borra una tarea."
						emptyIcon={<Bell className="h-6 w-6 text-muted-foreground" />}
					/>
				</div>
			)}
			{hasNextPage && (
				<div className="flex justify-center">
					<Button
						type="button"
						variant="ghost"
						loading={isFetchingNextPage}
						onClick={() => void fetchNextPage()}
					>
						Ver eventos anteriores
					</Button>
				</div>
			)}
		</section>
	)
}
