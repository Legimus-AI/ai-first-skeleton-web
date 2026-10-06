import {
	createFileRoute,
	type ErrorComponentProps,
	Navigate,
	Outlet,
	redirect,
	useRouterState,
} from '@tanstack/react-router'
import { RouteError } from '@/components/route-error'
import { AuthedLayout } from '@/layouts/authed-layout'
import { authQueryOptions, useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Skeleton } from '@/ui/skeleton'

export const Route = createFileRoute('/_authed')({
	beforeLoad: async ({ context, location }) => {
		// A stale user is re-checked in the background; AuthedPage redirects if it comes back null.
		const user = await context.queryClient.ensureQueryData({
			...authQueryOptions,
			revalidateIfStale: true,
		})
		if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
	},
	pendingMs: 200,
	pendingMinMs: 500,
	pendingComponent: AuthedPending,
	errorComponent: AuthedError,
	component: AuthedPage,
})

function AuthedPending() {
	return (
		<AuthedLayout>
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		</AuthedLayout>
	)
}

/** The session check itself failed (e.g. API down on first load): keep the menu around the error. */
function AuthedError(props: ErrorComponentProps) {
	return (
		<AuthedLayout>
			<RouteError {...props} />
		</AuthedLayout>
	)
}

function AuthedPage() {
	const { data: user } = useCurrentUser()
	// WHY: the page on screen, not a navigation in flight; while the login redirect is pending,
	// `location` already points at /login and each re-render would nest it into `redirect` again.
	const href = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).href })
	// A background check (window focus) found the session gone.
	if (user === null) return <Navigate to="/login" search={{ redirect: href }} replace />
	return (
		<AuthedLayout>
			<Outlet />
		</AuthedLayout>
	)
}
