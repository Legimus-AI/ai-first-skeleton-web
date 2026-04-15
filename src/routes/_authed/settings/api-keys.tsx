import { createFileRoute } from '@tanstack/react-router'
import { apiKeysQueryOptions } from '@/slices/auth/hooks/use-api-keys'
import { ApiKeysPage } from '@/slices/auth/components/api-keys-page'

export const Route = createFileRoute('/_authed/settings/api-keys')({
	loader: ({ context }) => context.queryClient.ensureQueryData(apiKeysQueryOptions),
	component: ApiKeysPage,
})
