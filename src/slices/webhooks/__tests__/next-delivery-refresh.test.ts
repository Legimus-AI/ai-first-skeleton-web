import type { WebhookEventListResponse } from '@repo/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextDeliveryRefresh } from '../hooks/use-webhooks'

const NOW = Date.parse('2026-10-05T10:00:00.000Z')

function pageWith(
	...deliveries: { status: 'pending' | 'delivered' | 'failed'; nextAttemptAt: string | null }[]
): WebhookEventListResponse {
	return {
		nextCursor: null,
		data: [
			{
				id: '0192f0c1-1111-7111-8111-111111111111',
				type: 'todo.created',
				resourceId: '550e8400-e29b-41d4-a716-446655440000',
				createdAt: '2026-10-05T09:59:00.000Z',
				deliveries: deliveries.map((delivery, index) => ({
					id: `0192f0c1-2222-7222-8222-22222222222${index}`,
					destinationId: '0192f0c1-3333-7333-8333-333333333333',
					attempts: 1,
					lastError: null,
					createdAt: '2026-10-05T09:59:00.000Z',
					...delivery,
				})),
			},
		],
	}
}

describe('nextDeliveryRefresh', () => {
	beforeEach(() => vi.useFakeTimers({ now: NOW }))
	afterEach(() => vi.useRealTimers())

	it('stops refreshing once every send has settled', () => {
		expect(nextDeliveryRefresh([pageWith({ status: 'delivered', nextAttemptAt: null })])).toBe(
			false,
		)
	})

	it('follows the worker while a send is due now', () => {
		expect(
			nextDeliveryRefresh([
				pageWith({ status: 'pending', nextAttemptAt: '2026-10-05T10:00:00.000Z' }),
			]),
		).toBe(5_000)
	})

	it('waits for a failed send to come up for retry instead of asking every 5 s', () => {
		const inTwoHours = new Date(NOW + 2 * 60 * 60 * 1000).toISOString()
		expect(nextDeliveryRefresh([pageWith({ status: 'pending', nextAttemptAt: inTwoHours })])).toBe(
			2 * 60 * 60 * 1000 + 5_000,
		)
	})
})
