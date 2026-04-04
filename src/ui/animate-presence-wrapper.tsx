import { AnimatePresence, type AnimatePresenceProps, m } from 'motion/react'
import { transition } from '@/lib/motion-config'

interface PageTransitionProps {
	/** Unique key for the current page/view — triggers exit/enter animation on change. */
	pageKey: string
	children: React.ReactNode
}

/** Animated page transition wrapper — fades out old content, fades in new content.
 *
 * Wrap your route outlet or conditional content to animate between views.
 *
 * Usage in _authed layout:
 * ```tsx
 * import { PageTransition } from '@/ui/animate-presence-wrapper'
 *
 * function AuthedLayout() {
 *   const { pathname } = useLocation()
 *   return (
 *     <AppLayout>
 *       <PageTransition pageKey={pathname}>
 *         <Outlet />
 *       </PageTransition>
 *     </AppLayout>
 *   )
 * }
 * ```
 */
export function PageTransition({ pageKey, children }: PageTransitionProps) {
	return (
		<AnimatePresence mode="wait">
			<m.div
				key={pageKey}
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -6 }}
				transition={transition.page}
			>
				{children}
			</m.div>
		</AnimatePresence>
	)
}

export type { AnimatePresenceProps }
/** Re-export AnimatePresence for direct use in components that need exit animations. */
export { AnimatePresence }
