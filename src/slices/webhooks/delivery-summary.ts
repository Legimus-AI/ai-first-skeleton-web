import type { WebhookDelivery } from '@repo/shared'

export type DeliveryState = 'delivered' | 'pending' | 'failed' | 'none'

export interface DeliverySummary {
	state: DeliveryState
	/** Every send attempt of the event, resends included. */
	attempts: number
	lastError: string | null
}

/** One state per event, judged by the latest send to each destination (a resend supersedes a failure). */
export function summarizeDeliveries(deliveries: readonly WebhookDelivery[]): DeliverySummary {
	const latestByDestination = new Map<string, WebhookDelivery>()
	for (const delivery of deliveries) latestByDestination.set(delivery.destinationId, delivery)
	const latest = [...latestByDestination.values()]

	let state: DeliveryState = 'delivered'
	if (latest.length === 0) state = 'none'
	else if (latest.some((delivery) => delivery.status === 'failed')) state = 'failed'
	else if (latest.some((delivery) => delivery.status === 'pending')) state = 'pending'

	return {
		state,
		attempts: deliveries.reduce((total, delivery) => total + delivery.attempts, 0),
		// The error behind the state shown; a send that got through may keep an earlier attempt's error.
		lastError:
			latest.find((delivery) => delivery.status === state && delivery.lastError)?.lastError ?? null,
	}
}
