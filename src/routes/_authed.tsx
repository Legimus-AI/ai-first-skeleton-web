import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AuthedLayout } from '@/layouts/authed-layout'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import { Skeleton } from '@/ui/skeleton'

export const Route = createFileRoute('/_authed')({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(authQueryOptions)
		if (!user) throw redirect({ to: '/login' })
	},
	pendingMs: 200,
	pendingMinMs: 500,
	pendingComponent: AuthedPending,
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

function AuthedPage() {
	return (
		<AuthedLayout>
			<Outlet />
		</AuthedLayout>
	)
}
