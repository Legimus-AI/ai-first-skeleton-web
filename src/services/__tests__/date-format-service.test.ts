import { afterEach, describe, expect, it, vi } from 'vitest'
import { locale as buildLocale } from '@/env'
import {
	formatDate,
	formatDateTime,
	getFormatLocale,
	getUnsupportedTimeZone,
	resetDateFormatPreferences,
	setDateFormatPreferences,
} from '@/services/date-format-service'

// 20:00 UTC: still the 12th in Lima (UTC−5), already the 13th in Kiritimati (UTC+14).
const EVENING_IN_UTC = '2026-10-12T20:00:00.000Z'

afterEach(() => {
	resetDateFormatPreferences()
	vi.restoreAllMocks()
})

describe('date formatting preferences', () => {
	it('shows the day of the chosen time zone', () => {
		setDateFormatPreferences({ locale: 'es-PE', timeZone: 'America/Lima' })
		expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe('12')

		setDateFormatPreferences({ locale: 'es-PE', timeZone: 'Pacific/Kiritimati' })
		expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe('13')
	})

	it('shows the hour of the chosen time zone', () => {
		setDateFormatPreferences({ locale: 'es-PE', timeZone: 'America/Lima' })
		expect(formatDateTime(EVENING_IN_UTC, { hour: 'numeric', hourCycle: 'h23' })).toBe('15')
	})

	it('writes the month in the chosen locale', () => {
		const dayAndMonth = { day: 'numeric', month: 'long' } as const
		setDateFormatPreferences({ locale: 'en-US', timeZone: 'America/Lima' })
		expect(formatDate(EVENING_IN_UTC, dayAndMonth)).toBe('October 12')

		setDateFormatPreferences({ locale: 'es-PE', timeZone: 'America/Lima' })
		expect(formatDate(EVENING_IN_UTC, dayAndMonth)).toBe('12 de octubre')
	})

	it('falls back to the browser zone, keeping the locale, when this browser cannot format the zone', () => {
		const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
		const browserDay = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(
			new Date(EVENING_IN_UTC),
		)

		setDateFormatPreferences({ locale: 'en-US', timeZone: 'Mars/Olympus' })

		expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe(browserDay)
		expect(formatDate(EVENING_IN_UTC, { month: 'long' })).toBe('October')
		expect(getUnsupportedTimeZone()).toBe('Mars/Olympus')
		expect(logError).toHaveBeenCalledWith(expect.stringContaining('Mars/Olympus'))

		setDateFormatPreferences({ locale: 'en-US', timeZone: 'America/Lima' })
		expect(getUnsupportedTimeZone()).toBeNull()
	})

	it('goes back to the build locale and the browser zone when reset', () => {
		setDateFormatPreferences({ locale: 'en-US', timeZone: 'Pacific/Kiritimati' })

		resetDateFormatPreferences()

		expect(formatDate(EVENING_IN_UTC, { month: 'long', year: 'numeric' })).toBe('octubre de 2026')
		expect(getUnsupportedTimeZone()).toBeNull()
	})

	it('hands the locale it formats in to other formatters, the build locale after a reset', () => {
		setDateFormatPreferences({ locale: 'en-US', timeZone: 'America/Lima' })
		expect(getFormatLocale()).toBe('en-US')

		resetDateFormatPreferences()
		expect(getFormatLocale()).toBe(buildLocale)
	})
})
