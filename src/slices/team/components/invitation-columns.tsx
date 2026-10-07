import type { PendingInvitation } from '@repo/shared'
import { MEMBER_ROLE_LABELS } from '@/constants/roles'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { X } from '@/ui/icons'
import { formatDate } from '@/utils/format-date'

/** Better Auth keeps an expired invitation pending; its link no longer works. */
function expiryLabel(expiresAt: string): string {
	const date = formatDate(expiresAt)
	return Date.parse(expiresAt) < Date.now() ? `Venció el ${date}` : `Vence el ${date}`
}

/** Pending invitations: who, which role, until when, and the cancel action. */
export function buildInvitationColumns(
	onCancel: (invitation: PendingInvitation) => void,
): Column<PendingInvitation>[] {
	return [
		{
			key: 'email',
			label: 'Email',
			render: (invitation) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-all">{invitation.email}</p>
					<p className="text-xs text-muted-foreground sm:hidden">
						{MEMBER_ROLE_LABELS[invitation.role]} · {expiryLabel(invitation.expiresAt)}
					</p>
				</div>
			),
		},
		{
			key: 'role',
			label: 'Rol',
			className: 'hidden sm:table-cell w-40',
			render: (invitation) => (
				<span className="text-sm text-muted-foreground">{MEMBER_ROLE_LABELS[invitation.role]}</span>
			),
		},
		{
			key: 'expiresAt',
			label: 'Vencimiento',
			className: 'hidden sm:table-cell w-44',
			render: (invitation) => (
				<span className="text-sm text-muted-foreground">{expiryLabel(invitation.expiresAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-12 text-right',
			render: (invitation) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-destructive"
					type="button"
					onClick={() => onCancel(invitation)}
					aria-label={`Anular la invitación de ${invitation.email}`}
				>
					<X className="h-4 w-4" />
				</Button>
			),
		},
	]
}
