import type { PendingInvitation } from '@repo/shared'
import { useMemo, useState } from 'react'
import { usePageInRange } from '@/hooks/use-page-in-range'
import { authErrorMessage } from '@/slices/auth/auth-error'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { DataTable } from '@/ui/data-table'
import { Mail, Plus } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Pagination } from '@/ui/pagination'
import { useCancelInvitation, usePendingInvitations } from '../hooks/use-team'
import { buildInvitationColumns } from './invitation-columns'

interface PendingInvitationsProps {
	/** The page shown, kept in the URL (`invitationsPage`) next to the members' own. */
	page: number
	onPageChange: (page: number) => void
	/** Opens the invite dialog, the empty state's call to action. */
	onInvite: () => void
}

/** "Invitaciones pendientes": who was invited and has not joined yet, each one cancelable. */
export function PendingInvitations({ page, onPageChange, onInvite }: PendingInvitationsProps) {
	const { data, isLoading, error, refetch } = usePendingInvitations({ page })
	const movingToLastPage = usePageInRange(data?.meta, onPageChange)
	const cancelInvitation = useCancelInvitation()
	const [toCancel, setToCancel] = useState<PendingInvitation | null>(null)
	const columns = useMemo(() => buildInvitationColumns(setToCancel), [])

	return (
		<section aria-labelledby="pending-invitations-title" className="space-y-4">
			<div className="space-y-1">
				<h2 id="pending-invitations-title" className="text-lg font-semibold tracking-tight">
					Invitaciones pendientes
				</h2>
				<p className="text-sm text-muted-foreground">
					Personas que invitaste y aún no se unen. Anula una invitación si ya no debe entrar.
				</p>
			</div>

			{error ? (
				<InlineError
					error={error}
					message={authErrorMessage(error)}
					onRetry={() => void refetch()}
				/>
			) : (
				<div className="rounded-surface bg-card shadow-surface">
					<DataTable
						data={data?.data ?? []}
						columns={columns}
						getId={(invitation) => invitation.id}
						getRowLabel={(invitation) => invitation.email}
						isLoading={isLoading || movingToLastPage}
						skeletonRows={2}
						emptyMessage="No hay invitaciones pendientes."
						emptyIcon={<Mail className="h-6 w-6 text-muted-foreground" />}
						emptyAction={
							<Button size="sm" variant="outline" onClick={onInvite}>
								<Plus className="mr-1.5 h-4 w-4" />
								Invitar miembro
							</Button>
						}
					/>
				</div>
			)}

			{data?.meta && data.meta.total > 0 && (
				<Pagination meta={data.meta} onPageChange={onPageChange} />
			)}

			<ConfirmDelete
				open={toCancel !== null}
				onOpenChange={() => setToCancel(null)}
				onConfirm={() => {
					if (toCancel)
						cancelInvitation.mutate(toCancel.id, {
							onSettled: () => setToCancel(null),
						})
				}}
				title="¿Anular la invitación?"
				description={
					toCancel
						? `${toCancel.email} ya no podrá unirse con el enlace que recibió. Podrás enviarle otra invitación cuando quieras.`
						: ''
				}
				confirmLabel="Anular invitación"
				isPending={cancelInvitation.isPending}
			/>
		</section>
	)
}
