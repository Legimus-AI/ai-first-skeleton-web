import { Link, useRouterState } from '@tanstack/react-router'
import { CheckCircle2, KeyRound, Menu } from 'lucide-react'
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

// ─── Default Navigation ───────────────────────────────────────────────────────
// Customize these items for your project. Each Link wraps a SidebarItem.

function DefaultSidebarNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	return (
		<SidebarContent>
			<SidebarGroup label="App">
				<Link to="/">
					<SidebarItem active={pathname === '/'}>
						<CheckCircle2 className="h-4 w-4" />
						Todos
					</SidebarItem>
				</Link>
			</SidebarGroup>
			<SidebarGroup label="System">
				<Link to="/api-keys">
					<SidebarItem active={pathname === '/api-keys'}>
						<KeyRound className="h-4 w-4" />
						API Keys
					</SidebarItem>
				</Link>
			</SidebarGroup>
		</SidebarContent>
	)
}

// ─── User Footer ──────────────────────────────────────────────────────────────

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

// ─── Mobile Header ────────────────────────────────────────────────────────────

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

// ─── Layout Shell ─────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen">
				<Sidebar>
					<SidebarHeader>
						<Link
							to="/"
							className="text-base font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary"
						>
							App {/* ← Change to your project name */}
						</Link>
					</SidebarHeader>
					<DefaultSidebarNav />
					<SidebarUserFooter />
				</Sidebar>
				<div className="flex min-w-0 flex-1 flex-col">
					<MobileHeader />
					<main className="flex-1 p-4 md:p-8">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	)
}
