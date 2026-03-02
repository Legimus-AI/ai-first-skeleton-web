import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
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
			<span className="text-sm text-muted-foreground">{user.email}</span>
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
