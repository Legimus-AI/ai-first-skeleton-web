/** The value when it is a non-empty string, else undefined: how optional search params are read. */
export function nonEmptyText(value: unknown): string | undefined {
	return typeof value === 'string' && value !== '' ? value : undefined
}
