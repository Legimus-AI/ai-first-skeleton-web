import { useMemo, useState } from 'react'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { Plus, Webhook } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { useDeleteWebhookDestination, useWebhookDestinations } from '../hooks/use-webhooks'
import { CreateWebhookDialog } from './create-webhook-dialog'
import { buildWebhookDestinationColumns } from './webhook-destination-columns'
import { WebhookEventsPanel } from './webhook-events-panel'
import { WebhookSecretNotice } from './webhook-secret-notice'

export function WebhooksPage() {
	const { data: destinations, isLoading, error, refetch } = useWebhookDestinations()
	const deleteDestination = useDeleteWebhookDestination()
	const [showCreate, setShowCreate] = useState(false)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [newSecret, setNewSecret] = useState<string | null>(null)

	const columns = useMemo(() => buildWebhookDestinationColumns(setDeleteId), [])

	const createButton = (
		<Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
			<Plus className="mr-1.5 h-4 w-4" />
			Crear destino
		</Button>
	)

	return (
		<FadeIn className="space-y-8">
			<div className="space-y-6">
				<CrudPageHeader
					title="Webhooks"
					description="Avisa a otros sistemas cuando cambia algo aquí. Cada envío va firmado."
					action={createButton}
				/>

				{newSecret && <WebhookSecretNotice secret={newSecret} onClose={() => setNewSecret(null)} />}

				{error ? (
					<InlineError error={error} onRetry={() => void refetch()} />
				) : (
					<div className="rounded-surface bg-card shadow-surface">
						<DataTable
							data={destinations ?? []}
							columns={columns}
							getId={(destination) => destination.id}
							isLoading={isLoading}
							emptyMessage="Sin destinos. Crea uno para recibir los eventos en tu sistema."
							emptyIcon={<Webhook className="h-6 w-6 text-muted-foreground" />}
							emptyAction={
								<Button size="sm" onClick={() => setShowCreate(true)}>
									<Plus className="mr-1.5 h-4 w-4" />
									Crear destino
								</Button>
							}
						/>
					</div>
				)}
			</div>

			<WebhookEventsPanel />

			<CreateWebhookDialog
				open={showCreate}
				onOpenChange={setShowCreate}
				onCreated={setNewSecret}
			/>

			<ConfirmDelete
				open={deleteId !== null}
				onOpenChange={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) deleteDestination.mutate(deleteId, { onSettled: () => setDeleteId(null) })
				}}
				title="¿Eliminar destino?"
				description="Dejará de recibir eventos de inmediato. Los envíos que tenía en cola se descartan."
				isPending={deleteDestination.isPending}
			/>
		</FadeIn>
	)
}
