/** Shared animation tokens — consistent timing across the entire app.
 *
 * Rules:
 * - Max 200ms for micro-interactions (button hover, toggle)
 * - Max 300ms for page transitions and modal enter/exit
 * - Always use `motion-safe:` in Tailwind for CSS animations
 * - These tokens are for Motion (framer-motion) programmatic animations
 */

/** Standard easing curve — feels natural for most UI transitions. */
export const easeOut = [0.16, 1, 0.3, 1] as const

/** Duration tokens in seconds. */
export const duration = {
	/** Micro-interactions: hover, focus, toggle. */
	fast: 0.15,
	/** Component enter/exit: modals, dropdowns, toasts. */
	normal: 0.2,
	/** Page transitions, layout animations. */
	slow: 0.3,
} as const

/** Shared transition presets for Motion components. */
export const transition = {
	/** Default for most UI elements. */
	default: { duration: duration.normal, ease: easeOut },
	/** Page-level transitions. */
	page: { duration: duration.slow, ease: easeOut },
	/** Quick micro-interactions. */
	fast: { duration: duration.fast, ease: easeOut },
} as const
