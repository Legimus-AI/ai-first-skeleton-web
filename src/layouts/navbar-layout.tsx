import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '@/ui/button'
import { UserDropdown } from '@/ui/user-dropdown'
import type { LayoutVariant } from './content-area'
import { ContentArea } from './content-area'
import { navItems } from './nav-items'

// ─── Horizontal Navbar Layout ───────────────────────────────────────────────
// Alternative to authed-layout.tsx (sidebar). For lighter apps, simpler tools,
// or verticals where a sidebar feels too heavy.
//
// Switch by changing the import in _authed.tsx:
//   import { AuthedLayout } from '@/layouts/navbar-layout'
//
// Same contract: uses nav-items.ts, ContentArea, dark mode, mobile responsive.

function NavLinks() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	return (
		<nav className="hidden items-center gap-1 md:flex">
			{navItems.map((item) => {
				const prefix = item.activePrefix ?? item.to
				const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
				return (
					<Link
						key={item.to}
						to={item.to}
						{...(item.search ? { search: item.search } : {})}
						className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
							isActive
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-accent hover:text-foreground'
						}`}
					>
						<item.icon className="h-4 w-4" />
						{item.label}
					</Link>
				)
			})}
		</nav>
	)
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	if (!open) return null

	return (
		<div className="border-b border-border bg-background md:hidden">
			<nav className="flex flex-col gap-1 p-2">
				{navItems.map((item) => {
					const prefix = item.activePrefix ?? item.to
					const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
					return (
						<Link
							key={item.to}
							to={item.to}
							{...(item.search ? { search: item.search } : {})}
							onClick={onClose}
							className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
								isActive
									? 'bg-primary/10 text-primary'
									: 'text-muted-foreground hover:bg-accent hover:text-foreground'
							}`}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</Link>
					)
				})}
			</nav>
		</div>
	)
}

interface NavbarLayoutProps {
	children: ReactNode
	variant?: LayoutVariant
}

/** Horizontal navbar layout — alternative to sidebar for lighter applications.
 *
 * To use: change the import in `_authed.tsx`:
 * ```tsx
 * import { AuthedLayout } from '@/layouts/navbar-layout'
 * ```
 */
export function AuthedLayout({ children, variant }: NavbarLayoutProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<div className="min-h-screen bg-background">
			{/* Top navbar */}
			<header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
					{/* Logo */}
					<Link
						to="/"
						className="text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
					>
						App {/* ← Change to your project name */}
					</Link>

					{/* Desktop nav */}
					<NavLinks />

					{/* Right side: user + mobile hamburger */}
					<div className="flex items-center gap-2">
						<div className="hidden md:block">
							<UserDropdown />
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="md:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
						>
							{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>
					</div>
				</div>
			</header>

			{/* Mobile menu */}
			<MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

			{/* Mobile user info */}
			{mobileMenuOpen && (
				<div className="border-b border-border bg-background p-3 md:hidden">
					<UserDropdown />
				</div>
			)}

			{/* Content */}
			<ContentArea {...(variant ? { variant } : {})}>{children}</ContentArea>
		</div>
	)
}
