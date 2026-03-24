import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/error-boundary'
import type { RouterContext } from '@/router'
import { Toaster } from '@/ui/sonner'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
})

function RootLayout() {
	return (
		<ErrorBoundary>
			<Outlet />
			<Toaster />
		</ErrorBoundary>
	)
}
