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
			<header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-border bg-background px-4">
				<Link
					to="/"
					className="text-sm font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-muted-foreground"
				>
					App {/* ← Change to your project name */}
				</Link>
				{/* Add your page navigation links here. Example:
				<Link to="/dashboard" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">Dashboard</Link>
				<Link to="/settings" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">Settings</Link>
				Use useRouterState to detect active route for styling. */}
				<div className="flex items-center gap-2">
					<UserMenu />
					<ThemeToggle />
				</div>
			</header>
			<div className="pt-12">
				<Outlet />
			</div>
			<Toaster />
		</ErrorBoundary>
	)
}
