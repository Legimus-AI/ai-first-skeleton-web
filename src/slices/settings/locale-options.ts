const LANGUAGE_NAMES = new Intl.DisplayNames(['es'], { type: 'language' })

/** "Español (Perú)" for `es-PE`. */
export function localeLabel(locale: string): string {
	const name = LANGUAGE_NAMES.of(locale) ?? locale
	return name.charAt(0).toUpperCase() + name.slice(1)
}
