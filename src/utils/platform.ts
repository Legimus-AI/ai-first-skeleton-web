/** Detect the user's operating system from the user agent string. */
export type Platform = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown'

export function getPlatform(): Platform {
	const ua = navigator.userAgent
	if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
	if (/Android/.test(ua)) return 'android'
	if (/Mac/.test(ua)) return 'macos'
	if (/Win/.test(ua)) return 'windows'
	if (/Linux/.test(ua)) return 'linux'
	return 'unknown'
}

export function isMac(): boolean {
	return getPlatform() === 'macos'
}

export function isWindows(): boolean {
	return getPlatform() === 'windows'
}

export function isMobile(): boolean {
	const p = getPlatform()
	return p === 'ios' || p === 'android'
}
