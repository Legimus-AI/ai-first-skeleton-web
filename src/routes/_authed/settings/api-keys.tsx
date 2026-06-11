import { createFileRoute } from '@tanstack/react-router'
import { ApiKeysPage } from '@/slices/auth/components/api-keys-page'
import { apiKeysQueryOptions } from '@/slices/auth/hooks/use-api-keys'

export const Route = createFileRoute('/_authed/settings/api-keys')({
	loader: ({ context }) => context.queryClient.ensureQueryData(apiKeysQueryOptions),
	component: ApiKeysPage,
})
