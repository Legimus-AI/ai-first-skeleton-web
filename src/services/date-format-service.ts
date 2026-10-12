import { locale as buildLocale } from '@/env'

interface DateFormatPreferences {
	locale: string
	/** IANA time zone; `undefined` formats in the browser's zone. */
	timeZone: string | undefined
}

const BUILD_PREFERENCES: DateFormatPreferences = { locale: buildLocale, timeZone: undefined }

// WHY: the signed-in shell replaces these with the account's settings before its pages render;
// pages outside it (login, register, email links) keep the build locale and the browser's zone.
let preferences = BUILD_PREFERENCES
let unsupportedTimeZone: string | null = null
const preferenceListeners = new Set<() => void>()

/** True when this browser's `Intl` knows the zone (its tz data may lag the server's). */
function canFormatIn(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone })
		return true
	} catch (error) {
		if (error instanceof RangeError) return false
		throw error
	}
}

/**
 * Locale and time zone every formatter below uses from now on. A zone this browser cannot format
 * falls back to the browser's zone (see `getUnsupportedTimeZone`): the dates still show.
 */
export function setDateFormatPreferences(next: DateFormatPreferences): void {
	const { timeZone } = next
	unsupportedTimeZone = timeZone !== undefined && !canFormatIn(timeZone) ? timeZone : null
	if (unsupportedTimeZone) {
		console.error(`This browser cannot format dates in the time zone "${unsupportedTimeZone}"`)
	}
	preferences = { locale: next.locale, timeZone: unsupportedTimeZone ? undefined : timeZone }
	for (const listener of preferenceListeners) listener()
}

/** Back to the build locale and the browser's zone (leaving the signed-in shell). */
export function resetDateFormatPreferences(): void {
	setDateFormatPreferences(BUILD_PREFERENCES)
}

/** The account's zone this browser could not format (dates show in the browser's zone), or null. */
export function getUnsupportedTimeZone(): string | null {
	return unsupportedTimeZone
}

/** Calls `listener` after every change of the preferences; returns the unsubscribe. */
export function subscribeToDateFormatPreferences(listener: () => void): () => void {
	preferenceListeners.add(listener)
	return () => {
		preferenceListeners.delete(listener)
	}
}

/** Format a date string or Date object for display. */
export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
): string {
	return new Intl.DateTimeFormat(preferences.locale, {
		timeZone: preferences.timeZone,
		...options,
	}).format(new Date(date))
}

/** Format a date with time. */
export function formatDateTime(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	},
): string {
	return formatDate(date, options)
}

/** Relative time in the app locale (e.g., "hace 2 horas"); a plain date after a week. */
export function formatRelative(date: string | Date): string {
	const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHr = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHr / 24)
	const relative = new Intl.RelativeTimeFormat(preferences.locale, { numeric: 'auto' })

	if (diffSec < 60) return relative.format(0, 'second')
	if (diffMin < 60) return relative.format(-diffMin, 'minute')
	if (diffHr < 24) return relative.format(-diffHr, 'hour')
	if (diffDay < 7) return relative.format(-diffDay, 'day')
	return formatDate(date)
}
