import { Link, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCurrentUser, useLogout } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarItem,
	SidebarProvider,
	useSidebar,
} from '@/ui/sidebar'
import { ThemeToggle } from '@/ui/theme-toggle'
import type { LayoutVariant } from './content-area'
import { ContentArea } from './content-area'
import { navItems } from './nav-items'

// ─── Data-Driven Navigation ──────────────────────────────────────────────────
// Items come from nav-items.ts. AI agents add entries there, not here.
// Architecture test INV-101 enforces this.

function SidebarNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	const groups = new Map<string, typeof navItems>()
	for (const item of navItems) {
		const group = groups.get(item.group) ?? []
		group.push(item)
		groups.set(item.group, group)
	}

	return (
		<SidebarContent>
			{[...groups.entries()].map(([group, items]) => (
				<SidebarGroup key={group} label={group}>
					{items.map((item) => {
						const prefix = item.activePrefix ?? item.to
						const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
						return (
							<Link key={item.to} to={item.to} {...(item.search ? { search: item.search } : {})}>
								<SidebarItem active={isActive}>
									<item.icon className="h-4 w-4" />
									{item.label}
								</SidebarItem>
							</Link>
						)
					})}
				</SidebarGroup>
			))}
		</SidebarContent>
	)
}

// ─── User Footer ─────────────────────────────────────────────────────────────

function SidebarUserFooter() {
	const { data: user } = useCurrentUser()
	const logout = useLogout()

	if (!user) return null

	return (
		<SidebarFooter>
			<div className="flex items-center gap-2">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
					{user.email.charAt(0).toUpperCase()}
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-foreground">{user.email}</p>
				</div>
				<ThemeToggle />
				<Button
					variant="ghost"
					size="sm"
					onClick={() => logout.mutate()}
					disabled={logout.isPending}
					className="text-xs text-muted-foreground"
				>
					Logout
				</Button>
			</div>
		</SidebarFooter>
	)
}

// ─── Mobile Header ───────────────────────────────────────────────────────────

function MobileHeader() {
	const { setOpen } = useSidebar()
	return (
		<header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
			<Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="Open menu">
				<Menu className="h-5 w-5" />
			</Button>
			<span className="text-sm font-semibold tracking-tight text-foreground">
				App {/* ← Change to your project name */}
			</span>
			<div className="ml-auto">
				<ThemeToggle />
			</div>
		</header>
	)
}

// ─── Layout Shell ────────────────────────────────────────────────────────────

interface AuthedLayoutProps {
	children: ReactNode
	variant?: LayoutVariant
}

export function AuthedLayout({ children, variant }: AuthedLayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen">
				<Sidebar>
					<SidebarHeader>
						<Link
							to="/todos"
							search={{ search: '', page: 1, sort: 'updatedAt', order: 'desc' as const }}
							className="text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
						>
							App {/* ← Change to your project name */}
						</Link>
					</SidebarHeader>
					<SidebarNav />
					<SidebarUserFooter />
				</Sidebar>
				<div className="flex min-w-0 flex-1 flex-col">
					<MobileHeader />
					<ContentArea {...(variant ? { variant } : {})}>{children}</ContentArea>
				</div>
			</div>
		</SidebarProvider>
	)
}
