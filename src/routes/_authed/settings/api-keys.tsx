import { createFileRoute } from '@tanstack/react-router'
import { ignoreCancelled } from '@/services/query-client'
import { ApiKeysPage } from '@/slices/auth/components/api-keys-page'
import { apiKeysQueryOptions } from '@/slices/auth/hooks/use-api-keys'
import { connectionsQueryOptions } from '@/slices/auth/hooks/use-connections'

export const Route = createFileRoute('/_authed/settings/api-keys')({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient
				.ensureQueryData({ ...apiKeysQueryOptions, revalidateIfStale: true })
				.catch(ignoreCancelled),
			context.queryClient
				.ensureQueryData({ ...connectionsQueryOptions, revalidateIfStale: true })
				.catch(ignoreCancelled),
		]),
	component: ApiKeysPage,
})
