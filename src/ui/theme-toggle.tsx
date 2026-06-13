import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import { Button } from '@/ui/button'
import { cn } from '@/utils/cn'

// Light/dark switch shared by every layout shell — single source so the four
// shells can't drift on icon, size, or label.
export function ThemeToggle({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme()
	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn('h-8 w-8', className)}
			onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
			aria-label="Cambiar tema"
		>
			{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</Button>
	)
}
