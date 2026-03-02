import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import type { RouterContext } from '@/router'
import { useCurrentUser, useLogout } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Toaster } from '@/ui/sonner'
import { ThemeToggle } from '@/ui/theme-toggle'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
})

function UserMenu() {
	const { data: user } = useCurrentUser()
	const logout = useLogout()

	if (!user) return null

	return (
		<div className="flex items-center gap-2">
			<Link to="/api-keys">
				<Button variant="ghost" size="sm" className="gap-1.5">
					<KeyRound className="h-4 w-4" />
					<span className="hidden sm:inline">API Keys</span>
				</Button>
			</Link>
			<span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
			<Button variant="ghost" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
				Logout
			</Button>
		</div>
	)
}

function RootLayout() {
	return (
		<ErrorBoundary>
			<div className="fixed right-2 top-2 z-50 flex items-center gap-2 sm:right-4 sm:top-4">
				<UserMenu />
				<ThemeToggle />
			</div>
			<Outlet />
			<Toaster />
		</ErrorBoundary>
	)
}
