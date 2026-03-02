import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(authQueryOptions)
		if (!user) throw redirect({ to: '/login' })
	},
	component: () => <Outlet />,
})
