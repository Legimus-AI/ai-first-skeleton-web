import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/app-layout'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'

export const Route = createFileRoute('/_authed')({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(authQueryOptions)
		if (!user) throw redirect({ to: '/login' })
	},
	component: AuthedLayout,
})

function AuthedLayout() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	)
}
