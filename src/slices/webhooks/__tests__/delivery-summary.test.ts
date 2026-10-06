import type { WebhookDelivery } from '@repo/shared'
import { describe, expect, it } from 'vitest'
import { summarizeDeliveries } from '../delivery-summary'

const FIRST_DESTINATION = '0192f0c1-1111-7111-8111-111111111111'
const SECOND_DESTINATION = '0192f0c1-2222-7222-8222-222222222222'

function delivery(overrides: Partial<WebhookDelivery>): WebhookDelivery {
	return {
		id: crypto.randomUUID(),
		destinationId: FIRST_DESTINATION,
		status: 'pending',
		attempts: 0,
		lastError: null,
		nextAttemptAt: null,
		createdAt: '2026-10-05T10:00:00.000Z',
		...overrides,
	}
}

describe('summarizeDeliveries', () => {
	it('says no destination received an event nobody was subscribed to', () => {
		expect(summarizeDeliveries([])).toEqual({ state: 'none', attempts: 0, lastError: null })
	})

	it('lets a resend that got through supersede the failed send before it', () => {
		const summary = summarizeDeliveries([
			delivery({ status: 'failed', attempts: 6, lastError: 'HTTP 500' }),
			delivery({ status: 'delivered', attempts: 1 }),
		])
		expect(summary).toEqual({ state: 'delivered', attempts: 7, lastError: null })
	})

	it('reports a failure on any destination, with its error', () => {
		const summary = summarizeDeliveries([
			delivery({ status: 'delivered', attempts: 1 }),
			delivery({
				destinationId: SECOND_DESTINATION,
				status: 'failed',
				attempts: 6,
				lastError: 'HTTP 404',
			}),
		])
		expect(summary).toEqual({ state: 'failed', attempts: 7, lastError: 'HTTP 404' })
	})

	it('shows the error of the destination that failed, not of one still retrying', () => {
		const summary = summarizeDeliveries([
			delivery({ status: 'failed', attempts: 6, lastError: 'HTTP 404' }),
			delivery({ destinationId: SECOND_DESTINATION, attempts: 2, lastError: 'HTTP 503' }),
		])
		expect(summary).toEqual({ state: 'failed', attempts: 8, lastError: 'HTTP 404' })
	})

	it('stays pending while a destination is still being retried', () => {
		const summary = summarizeDeliveries([
			delivery({ status: 'delivered', attempts: 1 }),
			delivery({ destinationId: SECOND_DESTINATION, attempts: 2, lastError: 'HTTP 503' }),
		])
		expect(summary).toEqual({ state: 'pending', attempts: 3, lastError: 'HTTP 503' })
	})
})
