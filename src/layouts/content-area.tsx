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

export type LayoutVariant = 'default' | 'full' | 'narrow' | 'wide'

const variantStyles: Record<LayoutVariant, string> = {
	default: 'mx-auto w-full max-w-7xl',
	wide: 'mx-auto w-full max-w-[1400px]',
	narrow: 'mx-auto w-full max-w-2xl',
	full: 'w-full',
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
	return (
		<main className={cn('flex-1 p-4 md:p-8', variantStyles[variant], className)}>
			<div key={pageKey} className="motion-safe:animate-fade-in">
				{children}
			</div>
		</main>
	)
}
