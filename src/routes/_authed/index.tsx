import { createFileRoute, redirect } from '@tanstack/react-router'
import { DEFAULT_LIST_PARAMS } from '@/lib/use-query-params'

export const Route = createFileRoute('/_authed/')({
	beforeLoad: () => {
		throw redirect({ to: '/todos', search: DEFAULT_LIST_PARAMS })
	},
})
