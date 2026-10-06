import {
	type CreateWebhookDestination,
	type CreateWebhookDestinationResponse,
	createWebhookDestinationResponseSchema,
	type WebhookDestinationListResponse,
	type WebhookEventListResponse,
	webhookDestinationListResponseSchema,
	webhookEventListResponseSchema,
} from '@repo/shared'
import {
	infiniteQueryOptions,
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { ApiError, safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

// WHY: the API's delivery worker looks for due sends every 5 s; refreshing faster shows nothing new.
const DELIVERY_REFRESH_MS = 5_000

/** Waits until the next send is due (a failed one may wait hours), never less than the worker's poll. */
export function nextDeliveryRefresh(pages: readonly WebhookEventListResponse[]): number | false {
	const dueTimes = pages.flatMap((page) =>
		page.data.flatMap((event) =>
			event.deliveries.flatMap((delivery) =>
				delivery.status === 'pending' && delivery.nextAttemptAt
					? [Date.parse(delivery.nextAttemptAt)]
					: [],
			),
		),
	)
	if (dueTimes.length === 0) return false
	return Math.max(DELIVERY_REFRESH_MS, Math.min(...dueTimes) - Date.now() + DELIVERY_REFRESH_MS)
}

const WEBHOOKS_KEY = ['webhooks'] as const

/** The API answers 409 to a create or resend while it records no events. */
export function webhookErrorMessage(error: unknown): string {
	return error instanceof ApiError && error.status === 409
		? 'Los eventos están apagados en el servidor: activa EVENTS_ENABLED para enviar webhooks.'
		: toUserMessage(error)
}

export const webhookDestinationsQueryOptions = queryOptions({
	queryKey: [...WEBHOOKS_KEY, 'destinations'],
	// Destinations plus `eventsEnabled`: while events are off, nothing can be created or resent.
	queryFn: async ({ signal }): Promise<WebhookDestinationListResponse> => {
		const res = await api.get('/api/v1/webhooks', undefined, signal)
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		return safeParseResponse(webhookDestinationListResponseSchema, json)
	},
})

/** Sent events, newest first; each page ends with a cursor to the older ones. */
export const webhookEventsQueryOptions = infiniteQueryOptions({
	queryKey: [...WEBHOOKS_KEY, 'events'],
	queryFn: async ({ pageParam, signal }): Promise<WebhookEventListResponse> => {
		const res = await api.get(
			'/api/v1/webhooks/events',
			{ order: 'desc', after: pageParam },
			signal,
		)
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		return safeParseResponse(webhookEventListResponseSchema, json)
	},
	initialPageParam: undefined as string | undefined,
	getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	// Keeps a pending send's status moving on screen until the worker settles it.
	refetchInterval: (query) => nextDeliveryRefresh(query.state.data?.pages ?? []),
})

export function useWebhookDestinations() {
	return useQuery(webhookDestinationsQueryOptions)
}

export function useWebhookEvents() {
	return useInfiniteQuery(webhookEventsQueryOptions)
}

export function useCreateWebhookDestination() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (
			input: CreateWebhookDestination,
		): Promise<CreateWebhookDestinationResponse> => {
			const res = await api.post('/api/v1/webhooks', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(createWebhookDestinationResponseSchema, json)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEY })
			toast.success('Destino creado', {
				description: 'Copia el secreto de firma ahora: no se volverá a mostrar.',
			})
		},
		// The create dialog shows the error itself, next to the form the user is looking at.
	})
}

export function useDeleteWebhookDestination() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (destinationId: string) => {
			const res = await api.delete(`/api/v1/webhooks/${destinationId}`)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEY })
			toast.success('Destino eliminado', { description: 'Ya no recibirá eventos.' })
		},
		onError: (error) => {
			toast.error('No se pudo eliminar el destino', { description: toUserMessage(error) })
		},
	})
}

export function useResendWebhookEvent() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (eventId: string) => {
			const res = await api.post(`/api/v1/webhooks/events/${eventId}/resend`, {})
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [...WEBHOOKS_KEY, 'events'] })
			toast.success('Evento reenviado', {
				description: 'Sale de nuevo hacia los destinos suscritos a su tipo.',
			})
		},
		onError: (error) => {
			toast.error('No se pudo reenviar el evento', { description: webhookErrorMessage(error) })
		},
	})
}
