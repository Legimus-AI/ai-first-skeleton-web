import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useCurrentUser, useLogout } from '@/slices/auth/hooks/use-auth'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { ThemeToggle } from '@/ui/theme-toggle'

/** Shared user dropdown — used by both sidebar and navbar layouts.
 *
 * Shows: avatar, email, Profile link, theme toggle, logout button.
 * Designed to work inline (sidebar footer) or in a header (navbar right side).
 */
export function UserDropdown() {
	const { data: user } = useCurrentUser()
	const logout = useLogout()

	if (!user) return null

	return (
		<div className="flex items-center gap-2">
			<Link
				to="/profile"
				className="flex items-center gap-2 rounded-md p-1 transition-colors duration-150 hover:bg-accent"
			>
				<Avatar size="sm" fallback={user.email.charAt(0).toUpperCase()} />
				<span className="hidden truncate text-sm font-medium text-foreground sm:inline">
					{user.name ?? user.email}
				</span>
			</Link>
			<ThemeToggle />
			<Button
				variant="ghost"
				size="sm"
				onClick={() => logout.mutate()}
				disabled={logout.isPending}
				aria-label="Logout"
				className="text-muted-foreground"
			>
				<LogOut className="h-4 w-4" />
			</Button>
		</div>
	)
}
