import { locale } from '@/env'

/** Format a date string or Date object for display. */
export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
): string {
	return new Intl.DateTimeFormat(locale, options).format(new Date(date))
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
	return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

/** Relative time (e.g., "2 hours ago"). */
export function formatRelative(date: string | Date): string {
	const now = Date.now()
	const then = new Date(date).getTime()
	const diffMs = now - then
	const diffSec = Math.floor(diffMs / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHr = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHr / 24)

	if (diffSec < 60) return 'just now'
	if (diffMin < 60) return `${diffMin}m ago`
	if (diffHr < 24) return `${diffHr}h ago`
	if (diffDay < 7) return `${diffDay}d ago`
	return formatDate(date)
}
