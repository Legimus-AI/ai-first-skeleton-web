import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, LogOut, Settings, UserCog } from 'lucide-react'
import { useCurrentUser, useLogout } from '@/slices/auth/hooks/use-auth'
import { Avatar } from '@/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/ui/dropdown-menu'

export function UserDropdown() {
	const { data: user } = useCurrentUser()
	const logout = useLogout()
	const navigate = useNavigate()

	if (!user) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<Avatar size="sm" name={user.name ?? user.email} />
					<span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground sm:inline">
						{user.name ?? user.email}
					</span>
					<ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent side="bottom" align="end" className="w-64">
				{/* User info header */}
				<div className="flex items-center gap-3 px-3 py-3">
					<Avatar size="lg" name={user.name ?? user.email} />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-foreground">
							{user.name ?? 'Usuario'}
						</p>
						<p className="truncate text-xs text-muted-foreground">{user.email}</p>
					</div>
				</div>
				<DropdownMenuSeparator />

				{/* Navigation items */}
				<DropdownMenuGroup>
					<DropdownMenuItem
						onSelect={() => void navigate({ to: '/profile' })}
						className="gap-2.5 px-3 py-2"
					>
						<UserCog className="h-4 w-4 text-muted-foreground" />
						Gestionar
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => void navigate({ to: '/api-keys' })}
						className="gap-2.5 px-3 py-2"
					>
						<Settings className="h-4 w-4 text-muted-foreground" />
						Configuracion
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				{/* Sign out */}
				<DropdownMenuItem
					onSelect={() => logout.mutate()}
					className="gap-2.5 px-3 py-2 text-destructive focus:text-destructive"
				>
					<LogOut className="h-4 w-4" />
					Cerrar sesion
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
