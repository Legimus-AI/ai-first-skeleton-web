import type { MemberRole, TeamMember, UpdateMemberRole } from '@repo/shared'
import { Shield, Trash2 } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { Select } from '@/ui/select'
import { formatDate } from '@/utils/format-date'

const ROLE_VARIANTS: Record<MemberRole, 'default' | 'success' | 'secondary'> = {
	owner: 'default',
	admin: 'success',
	user: 'secondary',
}

const ROLE_LABELS: Record<MemberRole, string> = {
	owner: 'Propietario',
	admin: 'Administrador',
	user: 'Miembro',
}

interface MemberColumnsOptions {
	onRoleChange: (id: string, role: UpdateMemberRole['role']) => void
	onDelete: (id: string) => void
	/** Your role grants `team:write`; without it every member is read-only. */
	canManage: boolean
	currentUserId: string | undefined
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
							{ROLE_LABELS[member.role]}
						</Badge>
					)
				}
				return (
					<Select
						value={member.role}
						onChange={(e) => onRoleChange(member.id, e.target.value as UpdateMemberRole['role'])}
						className="h-7 w-32 text-xs"
						aria-label={`Rol de ${member.name}`}
					>
						<option value="admin">{ROLE_LABELS.admin}</option>
						<option value="user">{ROLE_LABELS.user}</option>
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
						onClick={(e) => {
							e.stopPropagation()
							onDelete(member.id)
						}}
						aria-label={`Quitar a ${member.name}`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)
			},
		},
	]
}
