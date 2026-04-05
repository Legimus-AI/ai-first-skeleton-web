import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface AnimatedListItemProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	index?: number
	staggerDelay?: number
}

/** CSS-only staggered list item animation.
 *
 * Each item fades in with a slight delay based on its index.
 * Respects `prefers-reduced-motion` via `motion-safe:` prefix.
 */
export function AnimatedListItem({
	children,
	index = 0,
	staggerDelay = 0.03,
	className,
	style,
	...props
}: AnimatedListItemProps) {
	return (
		<div
			className={cn(
				'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200',
				className,
			)}
			style={{
				...style,
				animationDelay: `${Math.min(index * staggerDelay, 0.3)}s`,
			}}
			{...props}
		>
			{children}
		</div>
	)
}
