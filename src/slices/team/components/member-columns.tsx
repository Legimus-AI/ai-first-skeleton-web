import { assignableRoleSchema, type MemberRole, type TeamMember } from '@repo/shared'
import { MEMBER_ROLE_LABELS } from '@/constants/roles'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { Shield, Trash } from '@/ui/icons'
import { Select } from '@/ui/select'
import { formatDate } from '@/utils/format-date'
import type { AssignableRole } from '../team-form-schema'

const ROLE_VARIANTS: Record<MemberRole, 'default' | 'success' | 'secondary'> = {
	owner: 'default',
	admin: 'success',
	user: 'secondary',
}

interface MemberColumnsOptions {
	onRoleChange: (member: TeamMember, role: AssignableRole) => void
	onDelete: (member: TeamMember) => void
	/** Your role grants `team:write`; without it every member is read-only. */
	canManage: boolean
	currentUserId: string | undefined
	/** The member whose role change is in flight: their select waits for it. */
	roleChangePendingFor: string | undefined
}

/** The owner and yourself are never edited or removed from this table. */
export function isManageableMember(member: TeamMember, currentUserId: string | undefined) {
	return member.role !== 'owner' && member.id !== currentUserId
}

export function buildMemberColumns({
	onRoleChange,
	onDelete,
	canManage,
	currentUserId,
	roleChangePendingFor,
}: MemberColumnsOptions): Column<TeamMember>[] {
	return [
		{
			key: 'name',
			label: 'Miembro',
			sortable: true,
			render: (member) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-words">{member.name}</p>
					<p className="text-xs text-muted-foreground break-all">{member.email}</p>
				</div>
			),
		},
		{
			key: 'role',
			label: 'Rol',
			sortable: true,
			className: 'w-40',
			render: (member) => {
				if (!canManage || !isManageableMember(member, currentUserId)) {
					return (
						<Badge variant={ROLE_VARIANTS[member.role]}>
							{member.role === 'owner' && <Shield className="mr-1 h-3 w-3" />}
							{MEMBER_ROLE_LABELS[member.role]}
						</Badge>
					)
				}
				return (
					<Select
						value={member.role}
						onChange={(event) =>
							onRoleChange(member, assignableRoleSchema.parse(event.target.value))
						}
						disabled={member.id === roleChangePendingFor}
						className="h-7 w-32 text-xs"
						aria-label={`Rol de ${member.name}`}
					>
						<option value="admin">{MEMBER_ROLE_LABELS.admin}</option>
						<option value="user">{MEMBER_ROLE_LABELS.user}</option>
					</Select>
				)
			},
		},
		{
			key: 'emailVerified',
			label: 'Estado',
			className: 'hidden md:table-cell w-28',
			render: (member) => (
				<Badge variant={member.emailVerified ? 'success' : 'warning'}>
					{member.emailVerified ? 'Verificado' : 'Pendiente'}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			label: 'Se unió',
			sortable: true,
			className: 'hidden lg:table-cell w-32',
			render: (member) => (
				<span className="text-sm text-muted-foreground">{formatDate(member.createdAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-12 text-right',
			render: (member) => {
				if (!canManage || !isManageableMember(member, currentUserId)) return null
				return (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive"
						type="button"
						onClick={(event) => {
							event.stopPropagation()
							onDelete(member)
						}}
						aria-label={`Quitar a ${member.name}`}
					>
						<Trash className="h-4 w-4" />
					</Button>
				)
			},
		},
	]
}
