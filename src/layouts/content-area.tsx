import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

// ─── Layout Variants ─────────────────────────────────────────────────────────
// Routes declare their layout variant via route context or search params.
// ContentArea resolves the variant to the correct max-width constraint.
//
// Usage in route files:
//   export const Route = createFileRoute('/_authed/dashboard')({
//     context: () => ({ layout: 'full' as const }),
//     component: DashboardPage,
//   })

// `bleed` is for full-bleed, full-height surfaces (chat, canvas, board): no padding,
// no max-width, and it fills the shell vertically so a SplitPane can own its scroll.
// Shells that support it switch to a bounded height when the route opts in (see authed/
// focused layouts). All other variants keep the standard padded, page-scrolling area.
export type LayoutVariant = 'default' | 'full' | 'narrow' | 'wide' | 'bleed'

const variantStyles: Record<LayoutVariant, string> = {
	default: 'mx-auto w-full max-w-7xl p-4 md:p-8',
	wide: 'mx-auto w-full max-w-[1400px] p-4 md:p-8',
	narrow: 'mx-auto w-full max-w-2xl p-4 md:p-8',
	full: 'w-full p-4 md:p-8',
	bleed: 'flex w-full min-h-0 flex-col',
}

interface ContentAreaProps {
	variant?: LayoutVariant
	children: ReactNode
	className?: string
	/** Key to force re-mount on navigation (triggers fade-in animation). */
	pageKey?: string
}

export function ContentArea({
	variant = 'default',
	children,
	className,
	pageKey,
}: ContentAreaProps) {
	const isBleed = variant === 'bleed'
	return (
		<main className={cn('flex-1', variantStyles[variant], className)}>
			<div
				key={pageKey}
				className={cn('motion-safe:animate-fade-in', isBleed && 'flex min-h-0 flex-1 flex-col')}
			>
				{children}
			</div>
		</main>
	)
}
