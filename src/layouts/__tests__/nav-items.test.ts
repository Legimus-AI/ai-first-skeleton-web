import { rolePermissions } from '@repo/shared'
import { describe, expect, it } from 'vitest'
import { navItemsFor } from '../nav-items'

function settingsEntriesFor(role: string): string[] {
	const settings = navItemsFor(rolePermissions(role)).find((item) => item.to === '/settings')
	return settings?.children?.map((child) => child.to) ?? []
}

describe('navigation by role', () => {
	it('shows webhooks and the organization settings to owners and admins', () => {
		for (const role of ['owner', 'admin']) {
			expect(settingsEntriesFor(role)).toContain('/settings/webhooks')
			expect(settingsEntriesFor(role)).toContain('/settings/general')
		}
	})

	it('hides webhooks and the organization settings from members, who cannot change them', () => {
		const entries = settingsEntriesFor('user')
		expect(entries).not.toContain('/settings/webhooks')
		expect(entries).not.toContain('/settings/general')
		expect(entries).toContain('/settings/api-keys')
		expect(entries).toContain('/settings/preferences')
	})
})
