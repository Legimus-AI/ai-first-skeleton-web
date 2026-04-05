import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	delay?: number
}

/** CSS-only fade-in wrapper — animates children on mount with opacity + slight upward shift.
 *
 * Respects `prefers-reduced-motion` via `motion-safe:` prefix.
 */
export function FadeIn({ delay = 0, children, className, style, ...props }: FadeInProps) {
	return (
		<div
			className={cn(
				'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200',
				className,
			)}
			style={{ ...style, animationDelay: delay ? `${delay}s` : undefined }}
			{...props}
		>
			{children}
		</div>
	)
}
