import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { RouteError } from '@/components/route-error'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	context: { queryClient: {} as QueryClient },
	defaultPreload: 'intent',
	defaultPreloadStaleTime: 0,
	defaultViewTransition: true,
	// Errors render where the failing route renders, so the layout around it survives.
	defaultErrorComponent: RouteError,
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

export interface RouterContext {
	queryClient: QueryClient
}
