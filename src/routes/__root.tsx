import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/ui/sonner'
import { ThemeToggle } from '@/ui/theme-toggle'

export const Route = createRootRoute({
	component: () => (
		<ErrorBoundary>
			<div className="fixed right-4 top-4 z-50">
				<ThemeToggle />
			</div>
			<Outlet />
			<Toaster />
		</ErrorBoundary>
	),
})
