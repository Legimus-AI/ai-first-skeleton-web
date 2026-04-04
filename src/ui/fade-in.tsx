import { type HTMLMotionProps, m } from 'motion/react'
import { transition } from '@/lib/motion-config'

interface FadeInProps extends HTMLMotionProps<'div'> {
	/** Delay before animation starts (seconds). Default: 0. */
	delay?: number
}

/** Fade-in wrapper — animates children on mount with opacity + slight upward shift.
 *
 * Respects `prefers-reduced-motion` automatically (Motion handles this).
 *
 * Usage:
 * ```tsx
 * <FadeIn>
 *   <Card>Content appears with a smooth fade</Card>
 * </FadeIn>
 *
 * // With staggered children:
 * {items.map((item, i) => (
 *   <FadeIn key={item.id} delay={i * 0.05}>
 *     <Card>{item.name}</Card>
 *   </FadeIn>
 * ))}
 * ```
 */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ...transition.default, delay }}
			{...props}
		>
			{children}
		</m.div>
	)
}
