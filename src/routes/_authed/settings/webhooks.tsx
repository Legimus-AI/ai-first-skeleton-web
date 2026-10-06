import { createFileRoute } from '@tanstack/react-router'
import { ignoreCancelled } from '@/services/query-client'
import { WebhooksPage } from '@/slices/webhooks/components/webhooks-page'
import {
	webhookDestinationsQueryOptions,
	webhookEventsQueryOptions,
} from '@/slices/webhooks/hooks/use-webhooks'

export const Route = createFileRoute('/_authed/settings/webhooks')({
	// Only owners and admins may read webhooks; for anyone else the API's 403 renders in place.
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData({
				...webhookDestinationsQueryOptions,
				revalidateIfStale: true,
			}),
			context.queryClient.prefetchInfiniteQuery(webhookEventsQueryOptions),
		]).catch(ignoreCancelled),
	component: WebhooksPage,
})
