import { rolePermissions } from '@repo/shared'
import { describe, expect, it } from 'vitest'
import { navItemsFor } from '../nav-items'

function settingsEntriesFor(role: string): string[] {
	const settings = navItemsFor(rolePermissions(role)).find((item) => item.to === '/settings')
	return settings?.children?.map((child) => child.to) ?? []
}

describe('navigation by role', () => {
	it('shows webhooks to owners and admins', () => {
		expect(settingsEntriesFor('owner')).toContain('/settings/webhooks')
		expect(settingsEntriesFor('admin')).toContain('/settings/webhooks')
	})

	it('hides webhooks from members, who cannot use them', () => {
		const entries = settingsEntriesFor('user')
		expect(entries).not.toContain('/settings/webhooks')
		expect(entries).toContain('/settings/api-keys')
	})
})
