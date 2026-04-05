import type { MemberRole, TeamMember } from '@repo/shared'
import { Shield, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { Select } from '@/ui/select'

const ROLE_VARIANTS: Record<MemberRole, 'default' | 'success' | 'secondary'> = {
	owner: 'default',
	admin: 'success',
	user: 'secondary',
}

const ROLE_LABELS: Record<MemberRole, string> = {
	owner: 'Owner',
	admin: 'Admin',
	user: 'Member',
}

export function buildMemberColumns(
	onRoleChange: (id: string, role: MemberRole) => void,
	onDelete: (id: string) => void,
	currentUserId?: string,
): Column<TeamMember>[] {
	return [
		{
			key: 'name',
			label: 'Member',
			sortable: true,
			render: (member) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">{member.name}</p>
					<p className="text-xs text-muted-foreground">{member.email}</p>
				</div>
			),
		},
		{
			key: 'role',
			label: 'Role',
			sortable: true,
			className: 'w-40',
			render: (member) => {
				if (member.role === 'owner' || member.id === currentUserId) {
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
						onChange={(e) => onRoleChange(member.id, e.target.value as MemberRole)}
						className="h-7 w-28 text-xs"
					>
						<option value="admin">Admin</option>
						<option value="user">Member</option>
					</Select>
				)
			},
		},
		{
			key: 'emailVerified',
			label: 'Status',
			className: 'hidden md:table-cell w-28',
			render: (member) => (
				<Badge variant={member.emailVerified ? 'success' : 'warning'}>
					{member.emailVerified ? 'Verified' : 'Pending'}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			label: 'Joined',
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
				if (member.role === 'owner' || member.id === currentUserId) return null
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
						aria-label={`Remove ${member.name}`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)
			},
		},
	]
}
