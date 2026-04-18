import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
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
	return (
		<ThemeProvider>
			<ErrorBoundary>
				<Outlet />
				<Toaster />
			</ErrorBoundary>
		</ThemeProvider>
	)
}
