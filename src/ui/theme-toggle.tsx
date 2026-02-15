import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './button'

export function ThemeToggle() {
	const [theme, setTheme] = useState<'light' | 'dark'>(() => {
		if (typeof window === 'undefined') return 'light'
		const stored = localStorage.getItem('theme')
		if (stored === 'dark' || stored === 'light') return stored
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	})

	useEffect(() => {
		const root = document.documentElement
		if (theme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
		localStorage.setItem('theme', theme)
	}, [theme])

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
	}

	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme}>
			{theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
