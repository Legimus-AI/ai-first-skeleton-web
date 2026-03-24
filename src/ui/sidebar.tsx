import { createContext, type ReactNode, use, useState } from 'react'
import { cn } from '@/lib/cn'

// ─── Context ──────────────────────────────────────────────────────────────────

interface SidebarContextValue {
	open: boolean
	setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue>({ open: false, setOpen: () => {} })

export function useSidebar() {
	return use(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	return <SidebarContext value={{ open, setOpen }}>{children}</SidebarContext>
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
	const { open, setOpen } = useSidebar()
	return (
		<>
			{open && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
					onClick={() => setOpen(false)}
					aria-label="Close sidebar"
				/>
			)}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0',
					open ? 'translate-x-0' : '-translate-x-full',
					className,
				)}
			>
				{children}
			</aside>
		</>
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
	return <div className={cn('shrink-0 px-4 py-4', className)}>{children}</div>
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
	return (
		<div className={cn('mb-4', className)}>
			{label && (
				<p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{label}
				</p>
			)}
			<div className="space-y-0.5">{children}</div>
		</div>
	)
}

export function SidebarItem({
	children,
	active,
	disabled,
	className,
}: {
	children: ReactNode
	active?: boolean
	disabled?: boolean
	className?: string
}) {
	return (
		<div
			className={cn(
				'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150',
				active
					? 'bg-primary/10 text-primary'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
		>
			{children}
		</div>
	)
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
