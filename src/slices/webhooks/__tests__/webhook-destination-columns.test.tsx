import type { WebhookDestination } from '@repo/shared'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildWebhookDestinationColumns } from '../components/webhook-destination-columns'

const disabledDestination = {
	id: 'dest-1',
	url: 'https://example.com/hook',
	eventTypes: ['*'],
	createdAt: '2026-10-01T00:00:00.000Z',
	disabledAt: '2026-10-20T00:00:00.000Z',
	disabledReason: 'Disabled after 7 days of failed deliveries',
} as WebhookDestination

describe('webhook destination url cell', () => {
	it('shows Desactivado without nesting a block in a paragraph or echoing the backend reason', () => {
		const [urlColumn] = buildWebhookDestinationColumns(() => {})
		const { container } = render(<div>{urlColumn?.render(disabledDestination)}</div>)

		expect(container.textContent).toContain('Desactivado')
		expect(container.textContent).not.toContain('Disabled after')
		expect(container.querySelector('p div')).toBeNull()

		const activeDestination = {
			...disabledDestination,
			disabledAt: null,
			disabledReason: null,
		}
		const { container: activeContainer } = render(<div>{urlColumn?.render(activeDestination)}</div>)
		expect(activeContainer.textContent).not.toContain('Desactivado')
	})
})
