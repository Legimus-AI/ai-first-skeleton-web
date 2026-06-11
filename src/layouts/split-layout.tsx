import { Link, useRouterState } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '@/providers/theme-provider'
import { Button } from '@/ui/button'
import { UserDropdown } from '@/ui/user-dropdown'
import { navItems } from './nav-items'

// ─── Split Layout ────────────────────────────────────────────────────────────
// Shell for list+detail and conversational archetypes (inbox, chat, triage).
// Routes compose the body with the `SplitPane` primitive from '@/ui/split-pane'.
// Content is full-bleed — panes manage their own padding and scrolling.
// Switch by changing the import in _authed.tsx:
//   import { AuthedLayout } from '@/layouts/split-layout'

function HeaderNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	return (
		<nav className="hidden items-center gap-0.5 sm:flex">
			{navItems.map((item) => {
				const prefix = item.activePrefix ?? item.to
				const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
				return (
					<Link
						key={item.to}
						to={item.to}
						{...(item.search ? { search: item.search } : {})}
						className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium transition-colors duration-150 ${
							isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
						}`}
					>
						{item.label}
					</Link>
				)
			})}
		</nav>
	)
}

interface SplitLayoutProps {
	children: ReactNode
}

export function AuthedLayout({ children }: SplitLayoutProps) {
	const { resolvedTheme, setTheme } = useTheme()

	return (
		<div className="flex h-screen flex-col bg-background">
			<header className="z-30 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="flex h-12 items-center gap-4 px-4">
					<Link
						to="/"
						className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
					>
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
							A
						</div>
						<span className="hidden sm:inline">App</span>
					</Link>
					<HeaderNav />
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

			<main className="flex min-h-0 flex-1 flex-col">{children}</main>
		</div>
	)
}
