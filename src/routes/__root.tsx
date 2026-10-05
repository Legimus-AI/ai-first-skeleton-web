import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/error-boundary'
import { NotFound } from '@/layouts/not-found'
import { ThemeProvider } from '@/providers/theme-provider'
import type { RouterContext } from '@/router'
import { Toaster } from '@/ui/sonner'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
	notFoundComponent: NotFound,
})

function RootLayout() {
	const href = useRouterState({ select: (s) => s.location.href })
	return (
		<ThemeProvider>
			{/* Navigating away (menu, Back) clears a crashed screen. */}
			<ErrorBoundary resetKeys={[href]}>
				<Outlet />
			</ErrorBoundary>
			{/* Outside the boundary so toasts survive a crash. */}
			<Toaster />
		</ThemeProvider>
	)
}
