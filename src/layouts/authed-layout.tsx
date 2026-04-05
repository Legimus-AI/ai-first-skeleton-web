import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/ui/button'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarItem,
	SidebarProvider,
	useSidebar,
} from '@/ui/sidebar'
import { UserDropdown } from '@/ui/user-dropdown'
import type { LayoutVariant } from './content-area'
import { ContentArea } from './content-area'
import { navItems } from './nav-items'

// ─── Sidebar Navigation ────────────────────────────────────────────────────
// Items come from nav-items.ts. AI agents add entries there, not here.

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
								<SidebarItem active={isActive} label={item.label}>
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

// ─── Top Header ─────────────────────────────────────────────────────────────

function TopHeader() {
	const { setOpen } = useSidebar()
	const { resolvedTheme, setTheme } = useTheme()

	return (
		<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm dark:bg-background/80 dark:backdrop-blur-md md:px-6">
			{/* Boton hamburguesa movil */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 md:hidden"
				onClick={() => setOpen(true)}
				aria-label="Abrir menu"
			>
				<Menu className="h-5 w-5" />
			</Button>

			{/* Separador */}
			<div className="flex-1" />

			{/* Cambiar tema */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
				aria-label="Cambiar tema"
			>
				{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
			</Button>

			{/* Menu de usuario */}
			<UserDropdown />
		</header>
	)
}

// ─── Layout Shell ───────────────────────────────────────────────────────────

interface AuthedLayoutProps {
	children: ReactNode
	variant?: LayoutVariant
}

export function AuthedLayout({ children, variant }: AuthedLayoutProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname })

	return (
		<SidebarProvider>
			<div className="flex min-h-screen">
				<Sidebar>
					<SidebarHeader>
						<Link
							to="/todos"
							search={{ search: '', page: 1, sort: 'updatedAt', order: 'desc' as const }}
							className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
						>
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
								A
							</div>
							App
						</Link>
					</SidebarHeader>
					<SidebarNav />
				</Sidebar>
				<div className="flex min-w-0 flex-1 flex-col">
					<TopHeader />
					<ContentArea {...(variant ? { variant } : {})} pageKey={pathname}>
						{children}
					</ContentArea>
				</div>
			</div>
		</SidebarProvider>
	)
}
