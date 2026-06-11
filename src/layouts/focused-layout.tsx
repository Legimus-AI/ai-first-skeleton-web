import { Link, useRouterState } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '@/providers/theme-provider'
import { Button } from '@/ui/button'
import { UserDropdown } from '@/ui/user-dropdown'
import type { LayoutVariant } from './content-area'
import { ContentArea } from './content-area'

// ─── Focused Layout ──────────────────────────────────────────────────────────
// Minimal shell for single-artifact tools: editors, composers, review screens.
// No persistent navigation — the content is the hero.
// Switch by changing the import in _authed.tsx:
//   import { AuthedLayout } from '@/layouts/focused-layout'

interface FocusedLayoutProps {
	children: ReactNode
	variant?: LayoutVariant
}

export function AuthedLayout({ children, variant = 'narrow' }: FocusedLayoutProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const { resolvedTheme, setTheme } = useTheme()

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="flex h-12 items-center gap-3 px-4">
					<Link
						to="/"
						className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
					>
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
							A
						</div>
						<span className="hidden sm:inline">App</span>
					</Link>
					<div className="flex-1" />
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
						aria-label="Cambiar tema"
					>
						{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
					<UserDropdown />
				</div>
			</header>

			<ContentArea variant={variant} pageKey={pathname}>
				{children}
			</ContentArea>
		</div>
	)
}
