import { Link, useMatches, useRouterState } from '@tanstack/react-router'
import { ChevronRight, Menu, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
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
import type { NavItem } from './nav-items'
import { navItems } from './nav-items'

// ─── Sidebar Navigation ────────────────────────────────────────────────────
// Items come from nav-items.ts. AI agents add entries there, not here.

function SidebarNavItem({
	item,
	pathname,
	isCollapsed,
}: {
	item: NavItem
	pathname: string
	isCollapsed: boolean
}) {
	const prefix = item.activePrefix ?? item.to
	const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`)
	const hasChildren = item.children && item.children.length > 0
	const [isOpen, setIsOpen] = useState(isActive)

	const content = (
		<SidebarItem active={isActive && !hasChildren} label={item.label}>
			<item.icon
				className={cn(
					'h-4 w-4 shrink-0 transition-colors duration-200',
					isActive ? 'text-foreground' : 'text-muted-foreground',
				)}
			/>
			{!isCollapsed && (
				<div className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap">
					<span className="truncate">{item.label}</span>
					{hasChildren && (
						<ChevronRight
							className={cn(
								'ml-auto h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200',
								isOpen && 'rotate-90',
							)}
						/>
					)}
				</div>
			)}
		</SidebarItem>
	)

	if (hasChildren) {
		// When collapsed, show submenu as popover on click
		if (isCollapsed) {
			return (
				<div className="relative">
					<button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full">
						{content}
					</button>
					{isOpen && (
						<div className="absolute left-full top-0 z-[70] ml-2 min-w-[180px] rounded-lg border border-border bg-popover p-2 shadow-lg">
							<p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">{item.label}</p>
							{item.children?.map((child) => {
								const childPrefix = child.activePrefix ?? child.to
								const isChildActive =
									pathname === childPrefix || pathname.startsWith(`${childPrefix}/`)
								return (
									<Link
										key={child.to}
										to={child.to}
										{...(child.search ? { search: child.search } : {})}
										onClick={() => setIsOpen(false)}
									>
										<div
											className={cn(
												'flex items-center rounded-md px-2 py-1.5 text-sm transition-colors',
												isChildActive
													? 'bg-accent text-foreground font-medium'
													: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
											)}
										>
											{child.label}
										</div>
									</Link>
								)
							})}
						</div>
					)}
				</div>
			)
		}

		return (
			<div className="flex flex-col space-y-1">
				<button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
					{content}
				</button>
				<div
					className={cn(
						'grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
						isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
					)}
				>
					<div className="overflow-hidden">
						<div className="ml-9 mt-1 flex flex-col space-y-1 border-l border-border/50 pl-2">
							{item.children?.map((child) => {
								const childPrefix = child.activePrefix ?? child.to
								const isChildActive =
									pathname === childPrefix || pathname.startsWith(`${childPrefix}/`)
								return (
									<Link
										key={child.to}
										to={child.to}
										{...(child.search ? { search: child.search } : {})}
									>
										<div
											className={cn(
												'flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors duration-200',
												isChildActive
													? 'text-foreground font-medium'
													: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
											)}
										>
											<span className="truncate">{child.label}</span>
										</div>
									</Link>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<Link to={item.to} {...(item.search ? { search: item.search } : {})}>
			{content}
		</Link>
	)
}

function SidebarNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const { mode } = useSidebar()
	const isCollapsed = mode === 'collapsed'

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
					{items.map((item) => (
						<SidebarNavItem
							key={item.to}
							item={item}
							pathname={pathname}
							isCollapsed={isCollapsed}
						/>
					))}
				</SidebarGroup>
			))}
		</SidebarContent>
	)
}

function SidebarLogo() {
	const { mode } = useSidebar()
	const isCollapsed = mode === 'collapsed'
	return (
		<SidebarHeader>
			<Link
				to="/todos"
				search={{ search: '', page: 1, limit: 20, sort: 'updatedAt', order: 'desc' as const }}
				className={cn(
					'flex items-center text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary',
					isCollapsed ? 'justify-center' : 'gap-2.5',
				)}
			>
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
					A
				</div>
				{!isCollapsed && <span className="whitespace-nowrap">App</span>}
			</Link>
		</SidebarHeader>
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
	const matches = useMatches()
	const routeVariant = (matches[matches.length - 1]?.context as { layout?: LayoutVariant })?.layout
	const finalVariant = variant ?? routeVariant ?? 'default'

	return (
		<SidebarProvider>
			<div className="flex min-h-screen">
				<Sidebar>
					<SidebarLogo />
					<SidebarNav />
				</Sidebar>
				<div className="flex min-w-0 flex-1 flex-col">
					<TopHeader />
					<ContentArea variant={finalVariant} pageKey={pathname}>
						{children}
					</ContentArea>
				</div>
			</div>
		</SidebarProvider>
	)
}
