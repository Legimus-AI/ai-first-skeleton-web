import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppLogo } from '@/ui/app-logo'
import { ThemeToggle } from '@/ui/theme-toggle'
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

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="flex h-12 items-center gap-3 px-4">
					<AppLogo size="sm" />
					<div className="flex-1" />
					<ThemeToggle />
					<UserDropdown />
				</div>
			</header>

			<ContentArea variant={variant} pageKey={pathname}>
				{children}
			</ContentArea>
		</div>
	)
}
