import { m } from 'motion/react'
import { transition } from '@/lib/motion-config'

interface AnimatedListItemProps {
	/** Index for stagger delay calculation. */
	index: number
	/** Max stagger delay in seconds. Items beyond this get no additional delay. Default: 0.3. */
	maxDelay?: number
	children: React.ReactNode
}

/** Animated list item — staggers children entrance for a polished list reveal.
 *
 * Usage:
 * ```tsx
 * {items.map((item, i) => (
 *   <AnimatedListItem key={item.id} index={i}>
 *     <TodoRow todo={item} />
 *   </AnimatedListItem>
 * ))}
 * ```
 */
export function AnimatedListItem({ index, maxDelay = 0.3, children }: AnimatedListItemProps) {
	const delay = Math.min(index * 0.03, maxDelay)

	return (
		<m.div
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ ...transition.default, delay }}
		>
			{children}
		</m.div>
	)
}
