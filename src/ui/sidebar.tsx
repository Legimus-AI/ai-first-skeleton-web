import { createContext, type ReactNode, use, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from '@/ui/icons'
import { Tooltip } from '@/ui/tooltip'
import { cn } from '@/utils/cn'

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
					'group fixed inset-y-0 left-0 z-50 flex flex-col overflow-visible bg-card shadow-overlay transition-[width,transform] duration-300 ease-standard',
					// Desktop: a floating panel that stays in view while the page scrolls
					'md:sticky md:top-3 md:h-[calc(100dvh-1.5rem)] md:translate-x-0 md:self-start md:rounded-surface md:shadow-surface',
					// Mobile: always full 240px drawer
					'w-[240px]',
					// Desktop: respect collapse mode
					isCollapsed ? 'md:w-[64px]' : 'md:w-[240px]',
					open ? 'translate-x-0' : '-translate-x-full',
					className,
				)}
			>
				<div
					className={cn(
						'flex h-full flex-col overflow-hidden transition-[width] duration-300 ease-standard',
						'w-[240px]',
						isCollapsed ? 'md:w-[64px]' : 'md:w-[240px]',
					)}
				>
					{children}
				</div>

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
			className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-control transition-colors duration-150 ease-standard hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
			{label && mode !== 'collapsed' && (
				<p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground">{label}</p>
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
				'flex w-full items-center rounded-full py-2 text-sm transition-colors duration-150 ease-standard',
				isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
				active
					? 'bg-accent text-accent-foreground font-medium'
					: 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
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
