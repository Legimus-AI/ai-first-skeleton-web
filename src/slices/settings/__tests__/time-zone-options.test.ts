import { describe, expect, it } from 'vitest'
import { timeZoneGroups, timeZoneLabel, utcOffsetLabel } from '../time-zone-options'

const NOW = new Date('2026-10-12T12:00:00.000Z')

describe('time zone options', () => {
	it('labels each zone with its offset today', () => {
		expect(utcOffsetLabel('America/Lima', NOW)).toBe('UTC−5')
		expect(utcOffsetLabel('Asia/Kolkata', NOW)).toBe('UTC+5:30')
		expect(utcOffsetLabel('UTC', NOW)).toBe('UTC')
	})

	it('groups zones by region, in Spanish', () => {
		const america = timeZoneGroups(null, NOW).find((group) => group.region === 'América')
		expect(america?.options).toContainEqual({
			value: 'America/Lima',
			label: 'America/Lima (UTC−5)',
		})
	})

	it('keeps the saved zone even when the browser does not list it', () => {
		// WHY: browsers list only canonical names; an alias saved elsewhere must still show as chosen.
		const zones = timeZoneGroups('Etc/GMT+5', NOW).flatMap((group) => group.options)
		expect(zones.map((zone) => zone.value)).toContain('Etc/GMT+5')
	})

	it('labels a saved zone this browser cannot format with its bare name', () => {
		// WHY: the server's tz data can be newer than the browser's; the page must still render.
		expect(timeZoneLabel('Mars/Olympus', NOW)).toBe('Mars/Olympus')
		const zones = timeZoneGroups('Mars/Olympus', NOW).flatMap((group) => group.options)
		expect(zones).toContainEqual({ value: 'Mars/Olympus', label: 'Mars/Olympus' })
	})
})
