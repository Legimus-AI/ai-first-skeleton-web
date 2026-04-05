import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
	theme: Theme
	resolvedTheme: ResolvedTheme
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getStoredTheme(): Theme {
	if (typeof window === 'undefined') return 'system'
	return (localStorage.getItem('theme') as Theme) ?? 'system'
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
		if (next === 'system') {
			localStorage.removeItem('theme')
		} else {
			localStorage.setItem('theme', next)
		}
		const r = resolveTheme(next)
		setResolved(r)
		applyToDOM(r)
	}, [])

	// Apply on mount
	useEffect(() => {
		applyToDOM(resolved)
	}, [resolved])

	// Listen for OS preference changes when in system mode
	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => {
			if (getStoredTheme() === 'system') {
				const r = resolveTheme('system')
				setResolved(r)
				applyToDOM(r)
			}
		}
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	const value = useMemo(
		() => ({ theme, resolvedTheme: resolved, setTheme }),
		[theme, resolved, setTheme],
	)

	return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
	return ctx
}
