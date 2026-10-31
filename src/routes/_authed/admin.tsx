import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/hooks/use-query-params'
import { PlatformUsersPage } from '@/slices/admin/components/platform-users-page'

export const Route = createFileRoute('/_authed/admin')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	component: AdminRoutePage,
})

function AdminRoutePage() {
	return <PlatformUsersPage />
}
