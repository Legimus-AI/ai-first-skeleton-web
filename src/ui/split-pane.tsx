import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

// ─── SplitPane Primitive ─────────────────────────────────────────────────────
// Two-panel composition: a fixed-width list/navigation pane and a flexible
// detail pane. Used by inbox, chat, and master-detail archetypes.
// Below `md` the panes stack vertically (list first).

const listWidths = {
	sm: 'md:grid-cols-[260px_1fr]',
	md: 'md:grid-cols-[320px_1fr]',
	lg: 'md:grid-cols-[400px_1fr]',
} as const

interface SplitPaneProps {
	/** Left pane: conversation list, document tree, item list. */
	list: ReactNode
	/** Right pane: active conversation, editor, detail view. */
	detail: ReactNode
	/** Width preset for the list pane on md+ screens. */
	listWidth?: keyof typeof listWidths
	className?: string
}

export function SplitPane({ list, detail, listWidth = 'md', className }: SplitPaneProps) {
	return (
		<div className={cn('grid min-h-0 flex-1 grid-cols-1', listWidths[listWidth], className)}>
			<aside className="min-h-0 overflow-y-auto border-b border-border md:border-b-0 md:border-r">
				{list}
			</aside>
			<section className="flex min-h-0 flex-col overflow-y-auto">{detail}</section>
		</div>
	)
}
