export interface TimeZoneOption {
	value: string
	/** The zone with its offset today, e.g. `America/Lima (UTC−5)`. */
	label: string
}

export interface TimeZoneGroup {
	region: string
	options: TimeZoneOption[]
}

const REGION_LABELS: Record<string, string> = {
	Africa: 'África',
	America: 'América',
	Antarctica: 'Antártida',
	Arctic: 'Ártico',
	Asia: 'Asia',
	Atlantic: 'Atlántico',
	Australia: 'Australia',
	Europe: 'Europa',
	Indian: 'Índico',
	Pacific: 'Pacífico',
}
const OTHER_REGION = 'Otras'

/** `UTC−5`, `UTC+5:30` or `UTC`: the zone's offset at `now`. */
export function utcOffsetLabel(timeZone: string, now: Date): string {
	const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
		.formatToParts(now)
		.find((part) => part.type === 'timeZoneName')?.value
	if (!offset) throw new Error(`Intl gave no offset for the time zone ${timeZone}`)
	// "GMT-5" → "UTC−5" (a real minus sign). WHY: ICU versions write UTC itself as "GMT" or "GMT+0".
	const utcOffset = offset.replace('GMT', 'UTC').replace('-', '−')
	return utcOffset === 'UTC+0' ? 'UTC' : utcOffset
}

/** `America/Lima (UTC−5)`, or the bare name when this browser cannot format the zone. */
export function timeZoneLabel(timeZone: string, now: Date): string {
	try {
		return `${timeZone} (${utcOffsetLabel(timeZone, now)})`
	} catch (error) {
		if (error instanceof RangeError) return timeZone
		throw error
	}
}

/** Every zone the browser knows, by region; `currentZone` is listed even when the browser lacks it. */
export function timeZoneGroups(currentZone: string | null, now = new Date()): TimeZoneGroup[] {
	const zones = Intl.supportedValuesOf('timeZone')
	const allZones =
		currentZone && !zones.includes(currentZone) ? [...zones, currentZone].sort() : zones
	const groups = new Map<string, TimeZoneOption[]>()
	for (const zone of allZones) {
		const prefix = zone.split('/')[0] ?? zone
		const region = zone.includes('/') ? (REGION_LABELS[prefix] ?? prefix) : OTHER_REGION
		const options = groups.get(region) ?? []
		options.push({ value: zone, label: timeZoneLabel(zone, now) })
		groups.set(region, options)
	}
	return [...groups].map(([region, options]) => ({ region, options }))
}
