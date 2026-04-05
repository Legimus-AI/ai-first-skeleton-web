import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/error-boundary'
import { ThemeProvider } from '@/lib/theme-provider'
import type { RouterContext } from '@/router'
import { Toaster } from '@/ui/sonner'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
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
