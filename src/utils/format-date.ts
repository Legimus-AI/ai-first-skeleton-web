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

/** Relative time in the app locale (e.g., "hace 2 horas"); a plain date after a week. */
export function formatRelative(date: string | Date): string {
	const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
	const diffMin = Math.floor(diffSec / 60)
	const diffHr = Math.floor(diffMin / 60)
	const diffDay = Math.floor(diffHr / 24)
	const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

	if (diffSec < 60) return relative.format(0, 'second')
	if (diffMin < 60) return relative.format(-diffMin, 'minute')
	if (diffHr < 24) return relative.format(-diffHr, 'hour')
	if (diffDay < 7) return relative.format(-diffDay, 'day')
	return formatDate(date)
}
