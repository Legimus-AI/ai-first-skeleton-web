import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, Moon, Sun, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/ui/button'
import { UserDropdown } from '@/ui/user-dropdown'
import type { LayoutVariant } from './content-area'
import { ContentArea } from './content-area'
import { navItems } from './nav-items'

// ─── Horizontal Navbar Layout ───────────────────────────────────────────────
// World-class minimal navbar inspired by Vercel Dashboard.
// Switch by changing the import in _authed.tsx:
//   import { AuthedLayout } from '@/layouts/navbar-layout'

function NavLinks() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	return (
		<nav className="hidden items-center gap-0.5 md:flex">
			{navItems.map((item) => {
				const prefix = item.activePrefix ?? item.to
				const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
				return (
					<Link
						key={item.to}
						to={item.to}
						{...(item.search ? { search: item.search } : {})}
						className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
							isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
						}`}
					>
						{item.label}
						{isActive && (
							<span className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-full bg-foreground" />
						)}
					</Link>
				)
			})}
		</nav>
	)
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const { resolvedTheme, setTheme } = useTheme()

	if (!open) return null

	return (
		<div className="border-b border-border bg-background md:hidden">
			<nav className="flex flex-col gap-0.5 px-4 py-3">
				{navItems.map((item) => {
					const prefix = item.activePrefix ?? item.to
					const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
					return (
						<Link
							key={item.to}
							to={item.to}
							{...(item.search ? { search: item.search } : {})}
							onClick={onClose}
							className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
								isActive
									? 'bg-accent/10 text-foreground'
									: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
							}`}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</Link>
					)
				})}
			</nav>
			<div className="flex items-center justify-between border-t border-border px-4 py-3">
				<UserDropdown />
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
					aria-label="Cambiar tema"
				>
					{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
				</Button>
			</div>
		</div>
	)
}

interface NavbarLayoutProps {
	children: ReactNode
	variant?: LayoutVariant
}

export function AuthedLayout({ children, variant }: NavbarLayoutProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<div className="min-h-screen bg-background">
			{/* Top navbar */}
			<header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="mx-auto flex h-14 items-center gap-6 px-4 md:px-6">
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
							A
						</div>
						<span className="hidden sm:inline">App</span>
					</Link>

					{/* Desktop nav — text-only links with active underline */}
					<NavLinks />

					{/* Spacer */}
					<div className="flex-1" />

					{/* Right side: user dropdown + mobile hamburger */}
					<div className="hidden md:block">
						<UserDropdown />
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
					>
						{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>
			</header>

			{/* Mobile menu */}
			<MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

			{/* Content */}
			<ContentArea {...(variant ? { variant } : {})} pageKey={pathname}>
				{children}
			</ContentArea>
		</div>
	)
}
