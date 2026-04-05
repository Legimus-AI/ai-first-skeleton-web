import type { ReactNode } from 'react'

interface PageTransitionProps {
	/** Unique key for the current page/view — triggers enter animation on change. */
	pageKey: string
	children: ReactNode
}

/** CSS-only page transition — subtle fade-in on route change.
 *
 * Uses Tailwind animate-in from tw-animate-css. Respects prefers-reduced-motion.
 */
export function PageTransition({ pageKey, children }: PageTransitionProps) {
	return (
		<div
			key={pageKey}
			className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
		>
			{children}
		</div>
	)
}
