import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { PublicLayout } from '@/layouts/public-layout'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import { Skeleton } from '@/ui/skeleton'

/**
 * Signed-in pages without the app shell: OAuth consent for MCP clients and CLI login approval.
 * Without a session they send the user to sign in and come back to the same URL.
 */
export const Route = createFileRoute('/_session')({
	beforeLoad: async ({ context, location }) => {
		const user = await context.queryClient.ensureQueryData({
			...authQueryOptions,
			revalidateIfStale: true,
		})
		if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
	},
	pendingMs: 200,
	pendingMinMs: 500,
	pendingComponent: SessionPending,
	component: Outlet,
})

function SessionPending() {
	return (
		<PublicLayout title="Un momento" description="Revisamos tu sesión.">
			<Skeleton className="h-24 w-full" />
		</PublicLayout>
	)
}
