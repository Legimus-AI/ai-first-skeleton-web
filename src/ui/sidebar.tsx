import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
					'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border transition-all duration-200 md:static md:translate-x-0',
					'aether-glass',
					isCollapsed ? 'w-16' : 'w-60',
					open ? 'translate-x-0' : '-translate-x-full',
					className,
				)}
			>
				{children}
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
			className="hidden rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground md:block"
			aria-label={mode === 'expanded' ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
		>
			{mode === 'expanded' ? (
				<PanelLeftClose className="h-4 w-4" />
			) : (
				<PanelLeftOpen className="h-4 w-4" />
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
	const { mode } = useSidebar()
	return (
		<div
			className={cn(
				'flex shrink-0 items-center justify-between px-4 py-4',
				mode === 'collapsed' && 'justify-center px-2',
				className,
			)}
		>
			{mode === 'expanded' ? children : null}
			<SidebarCollapseToggle />
		</div>
	)
}

export function SidebarContent({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return <nav className={cn('flex-1 overflow-y-auto px-3 py-2', className)}>{children}</nav>
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
			{label && mode === 'expanded' && (
				<p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
				'relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150',
				isCollapsed && 'justify-center px-0',
				active
					? 'bg-primary/10 text-primary dark:shadow-[0_0_12px_2px_var(--glow-color)]'
					: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
				active && 'border-l-2 border-primary',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
		>
			{isCollapsed
				? (() => {
						const childArray = Array.isArray(children) ? children : [children]
						return childArray[0]
					})()
				: children}
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
	const { mode } = useSidebar()
	if (mode === 'collapsed') return null
	return (
		<div className={cn('shrink-0 border-t border-border px-4 py-3', className)}>{children}</div>
	)
}
