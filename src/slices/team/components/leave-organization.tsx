import { useState } from 'react'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { useLeaveOrganization } from '../hooks/use-team'

/** "Salir de la organización": any member may leave; the API refuses the last owner. */
export function LeaveOrganization() {
	const leaveOrganization = useLeaveOrganization()
	const [showConfirm, setShowConfirm] = useState(false)

	return (
		<section aria-labelledby="leave-organization-title" className="space-y-3">
			<div className="space-y-1">
				<h2 id="leave-organization-title" className="text-lg font-semibold tracking-tight">
					Salir de la organización
				</h2>
				<p className="text-sm text-muted-foreground">
					Pierdes el acceso a sus datos, cerramos tu sesión y, al volver a entrar, tendrás una
					organización personal nueva. Si eres el último propietario, primero pasa la propiedad a
					otro miembro.
				</p>
			</div>
			<Button type="button" variant="outline" onClick={() => setShowConfirm(true)}>
				Salir de la organización
			</Button>

			<ConfirmDelete
				open={showConfirm}
				onOpenChange={setShowConfirm}
				onConfirm={() =>
					leaveOrganization.mutate(undefined, { onSettled: () => setShowConfirm(false) })
				}
				title="¿Salir de la organización?"
				description="Perderás el acceso de inmediato y cerraremos tu sesión. Como esta cuenta tendrá su propia organización, ya no podrá aceptar una invitación para volver: tendrías que usar otra cuenta."
				confirmLabel="Salir"
				isPending={leaveOrganization.isPending}
			/>
		</section>
	)
}
