import { type ComponentProps, useMemo } from 'react'
import { Select } from '@/ui/select'
import { timeZoneGroups } from '../time-zone-options'

const BROWSER_ZONES = new Set(Intl.supportedValuesOf('timeZone'))

interface TimeZoneSelectProps extends Omit<ComponentProps<'select'>, 'value'> {
	/** The chosen zone; `null` selects the option passed as `children`. */
	value: string | null
}

/** Native select of every IANA zone, grouped by region; `children` go first (e.g. "inherit"). */
export function TimeZoneSelect({ value, children, ...selectProps }: TimeZoneSelectProps) {
	// WHY: the labelled list of every zone is rebuilt only when needed: when a zone the browser
	// does not list must be added, never on a selection from the list.
	const unlistedZone = value !== null && !BROWSER_ZONES.has(value) ? value : null
	const groups = useMemo(() => timeZoneGroups(unlistedZone), [unlistedZone])
	return (
		<Select value={value ?? ''} {...selectProps}>
			{children}
			{groups.map((group) => (
				<optgroup key={group.region} label={group.region}>
					{group.options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</optgroup>
			))}
		</Select>
	)
}
