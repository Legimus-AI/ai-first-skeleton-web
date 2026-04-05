import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createContext, type ReactNode, use, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Tooltip } from '@/ui/tooltip'

// ─── Context ──────────────────────────────────────────────────────────────────

type SidebarMode = 'expanded' | 'collapsed'

interface SidebarContextValue {
	/** Mobile overlay open state. */
	open: boolean
	setOpen: (open: boolean) => void
	/** Desktop expand/collapse state. */
	mode: SidebarMode
	toggleMode: () => void
}

const STORAGE_KEY = 'sidebar-mode'

const SidebarContext = createContext<SidebarContextValue>({
	open: false,
	setOpen: () => {},
	mode: 'expanded',
	toggleMode: () => {},
})

export function useSidebar() {
	return use(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const [mode, setMode] = useState<SidebarMode>(() => {
		if (typeof window === 'undefined') return 'expanded'
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored === 'collapsed' ? 'collapsed' : 'expanded'
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, mode)
	}, [mode])

	const toggleMode = () => setMode((m) => (m === 'expanded' ? 'collapsed' : 'expanded'))

	return <SidebarContext value={{ open, setOpen, mode, toggleMode }}>{children}</SidebarContext>
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
	const { open, setOpen, mode } = useSidebar()
	const isCollapsed = mode === 'collapsed'
	return (
		<>
			{open && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
					onClick={() => setOpen(false)}
					aria-label="Cerrar barra lateral"
				/>
			)}
			<aside
				className={cn(
					'group relative fixed inset-y-0 left-0 z-50 flex flex-col overflow-visible border-r border-border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0',
					'aether-glass',
					isCollapsed ? 'w-[64px] hover:w-[240px]' : 'w-[240px]',
					open ? 'translate-x-0' : '-translate-x-full',
					className,
				)}
			>
				<div className="flex h-full w-[240px] flex-col overflow-hidden">{children}</div>

				{/* Floating Toggle Button (Desktop only) */}
				<div className="absolute -right-3 top-5 z-[60] hidden md:block">
					<SidebarCollapseToggle />
				</div>
			</aside>
		</>
	)
}

// ─── Collapse Toggle ─────────────────────────────────────────────────────────

export function SidebarCollapseToggle() {
	const { mode, toggleMode } = useSidebar()
	return (
		<button
			type="button"
			onClick={toggleMode}
			className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			aria-label={mode === 'expanded' ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
		>
			{mode === 'expanded' ? (
				<ChevronLeft className="h-3.5 w-3.5" />
			) : (
				<ChevronRight className="h-3.5 w-3.5" />
			)}
		</button>
	)
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export function SidebarHeader({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return <div className={cn('flex h-14 shrink-0 items-center px-4', className)}>{children}</div>
}

export function SidebarContent({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<nav className={cn('flex-1 overflow-y-auto overflow-x-hidden px-3 py-2', className)}>
			{children}
		</nav>
	)
}

export function SidebarGroup({
	label,
	children,
	className,
}: {
	label?: string
	children: ReactNode
	className?: string
}) {
	const { mode } = useSidebar()
	return (
		<div className={cn('mb-6', className)}>
			{label && (
				<p
					className={cn(
						'mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-opacity duration-300',
						mode === 'collapsed' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
					)}
				>
					{label}
				</p>
			)}
			<div className="space-y-1">{children}</div>
		</div>
	)
}

export function SidebarItem({
	children,
	active,
	disabled,
	label,
	className,
}: {
	children: ReactNode
	active?: boolean
	disabled?: boolean
	label?: string
	className?: string
}) {
	const { mode } = useSidebar()
	const isCollapsed = mode === 'collapsed'

	const content = (
		<div
			className={cn(
				'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200',
				active
					? 'bg-accent text-accent-foreground font-medium'
					: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
		>
			{children}
		</div>
	)

	if (isCollapsed && label) {
		return (
			<Tooltip content={label} side="right">
				{content}
			</Tooltip>
		)
	}

	return content
}

export function SidebarFooter({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<div className={cn('shrink-0 border-t border-border px-4 py-3', className)}>{children}</div>
	)
}
