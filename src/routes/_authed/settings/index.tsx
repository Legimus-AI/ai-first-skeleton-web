import { createFileRoute, redirect } from '@tanstack/react-router'
import { DEFAULT_LIST_PARAMS } from '@/hooks/use-query-params'

export const Route = createFileRoute('/_authed/settings/')({
	beforeLoad: () => {
		throw redirect({ to: '/settings/team', search: DEFAULT_LIST_PARAMS })
	},
})
