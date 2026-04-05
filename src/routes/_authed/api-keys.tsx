import { createFileRoute } from '@tanstack/react-router'
import { ApiKeysPage } from '@/slices/auth/components/api-keys-page'

export const Route = createFileRoute('/_authed/api-keys')({
	component: ApiKeysPage,
})
