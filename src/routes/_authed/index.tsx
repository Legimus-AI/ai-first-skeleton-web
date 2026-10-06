import { createFileRoute, redirect } from '@tanstack/react-router'
import { HOME_PATH } from '@/constants/routes'

export const Route = createFileRoute('/_authed/')({
	beforeLoad: () => {
		throw redirect({ href: HOME_PATH })
	},
})
