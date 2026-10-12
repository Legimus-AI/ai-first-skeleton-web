import { Hint } from '@/ui/hint'
import { unsupportedTimeZoneMessage, useUnsupportedTimeZone } from '../hooks/use-settings'

/** Warns that this browser cannot format the account's zone: dates show in the device's zone. */
export function UnsupportedTimeZoneHint() {
	const unsupportedTimeZone = useUnsupportedTimeZone()
	if (!unsupportedTimeZone) return null
	return <Hint variant="warning">{unsupportedTimeZoneMessage(unsupportedTimeZone)}</Hint>
}
