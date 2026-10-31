import type { PlatformUserView } from '@/slices/auth/auth-client'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'

interface PlatformUserColumnsOptions {
	onBan: (user: PlatformUserView) => void
	onUnban: (user: PlatformUserView) => void
	currentUserId: string | undefined
}

/** The platform users table: who, their state, and ban or unban (never for yourself). */
export function buildPlatformUserColumns({
	onBan,
	onUnban,
	currentUserId,
}: PlatformUserColumnsOptions): Column<PlatformUserView>[] {
	return [
		{
			key: 'name',
			label: 'Usuario',
			render: (user) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-words">{user.name}</p>
					<p className="text-xs text-muted-foreground break-all">{user.email}</p>
				</div>
			),
		},
		{
			key: 'banned',
			label: 'Estado',
			className: 'w-28',
			render: (user) => (
				<Badge variant={user.banned ? 'destructive' : 'success'}>
					{user.banned ? 'Bloqueado' : 'Activo'}
				</Badge>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-32 text-right',
			render: (user) => {
				if (user.id === currentUserId) return null
				return user.banned ? (
					<Button type="button" size="sm" variant="outline" onClick={() => onUnban(user)}>
						Desbloquear
					</Button>
				) : (
					<Button
						type="button"
						size="sm"
						variant="ghost"
						className="text-muted-foreground hover:text-destructive"
						onClick={() => onBan(user)}
					>
						Bloquear
					</Button>
				)
			},
		},
	]
}
