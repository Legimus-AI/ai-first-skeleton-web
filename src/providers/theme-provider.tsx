import { type Theme, themeSchema } from '@repo/shared'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
	theme: Theme
	resolvedTheme: ResolvedTheme
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Runs a localStorage access, or returns `fallback` when storage is blocked (private mode). */
function withStorage<T>(access: () => T, fallback: T): T {
	try {
		return access()
	} catch (error) {
		if (error instanceof DOMException) return fallback
		throw error
	}
}

function getStoredTheme(): Theme {
	if (typeof window === 'undefined') return 'system'
	const storedTheme = themeSchema.safeParse(withStorage(() => localStorage.getItem('theme'), null))
	return storedTheme.success ? storedTheme.data : 'system'
}

function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	}
	return theme
}

function applyToDOM(resolved: ResolvedTheme) {
	document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getStoredTheme)
	const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(theme))

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next)
		// Blocked storage only loses the first-paint cache; the theme still applies.
		withStorage(() => {
			if (next === 'system') localStorage.removeItem('theme')
			else localStorage.setItem('theme', next)
		}, undefined)
		const nextResolvedTheme = resolveTheme(next)
		setResolved(nextResolvedTheme)
		applyToDOM(nextResolvedTheme)
	}, [])

	// Apply on mount
	useEffect(() => {
		applyToDOM(resolved)
	}, [resolved])

	// Listen for OS preference changes when in system mode
	useEffect(() => {
		const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => {
			if (getStoredTheme() === 'system') {
				const systemResolvedTheme = resolveTheme('system')
				setResolved(systemResolvedTheme)
				applyToDOM(systemResolvedTheme)
			}
		}
		darkSchemeQuery.addEventListener('change', handler)
		return () => darkSchemeQuery.removeEventListener('change', handler)
	}, [])

	const value = useMemo(
		() => ({ theme, resolvedTheme: resolved, setTheme }),
		[theme, resolved, setTheme],
	)

	return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
	const themeContext = useContext(ThemeContext)
	if (!themeContext) throw new Error('useTheme must be used within ThemeProvider')
	return themeContext
}
