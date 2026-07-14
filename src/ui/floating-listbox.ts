import {
	type CSSProperties,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

export const FLOATING_LISTBOX_ATTR = 'data-floating-listbox'

const VIEWPORT_GAP_PX = 12
const TRIGGER_GAP_PX = 6
const DEFAULT_MAX_HEIGHT_PX = 280

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

/** Resolve the shared portal parent for floating listboxes. */
export function getFloatingListboxContainer(triggerElement?: HTMLElement | null): Element {
	return triggerElement?.ownerDocument.body ?? document.body
}

/** Detect clicks inside a floating listbox portal. */
export function isFloatingListboxEventTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(`[${FLOATING_LISTBOX_ATTR}]`) !== null
}

/** Keep portaled listboxes open while users click or drag their scrollbar. */
export function useFloatingListboxBlurGuard<T extends HTMLElement>(ownerRef: RefObject<T | null>) {
	const isPointerInsideListboxRef = useRef(false)

	const markFloatingListboxPointerDown = useCallback(() => {
		isPointerInsideListboxRef.current = true
	}, [])

	useEffect(() => {
		const resetPointerState = () => {
			isPointerInsideListboxRef.current = false
		}
		window.addEventListener('pointerup', resetPointerState, true)
		window.addEventListener('pointercancel', resetPointerState, true)
		return () => {
			window.removeEventListener('pointerup', resetPointerState, true)
			window.removeEventListener('pointercancel', resetPointerState, true)
		}
	}, [])

	const shouldKeepOpenOnBlur = useCallback(
		(relatedTarget: EventTarget | null): boolean => {
			if (relatedTarget instanceof Node) {
				if (ownerRef.current?.contains(relatedTarget)) return true
				if (isFloatingListboxEventTarget(relatedTarget)) return true
			}
			return isPointerInsideListboxRef.current
		},
		[ownerRef],
	)

	return { markFloatingListboxPointerDown, shouldKeepOpenOnBlur }
}

/** Compute viewport-bounded listbox styles for the global portal layer. */
export function getFloatingListboxStyle({
	triggerElement,
	maxHeight = DEFAULT_MAX_HEIGHT_PX,
}: {
	triggerElement: HTMLElement | null
	maxHeight?: number
}): CSSProperties {
	if (!triggerElement) return {}

	const triggerRect = triggerElement.getBoundingClientRect()
	const viewportWidth = document.documentElement.clientWidth
	const viewportHeight = window.innerHeight
	const boundaryLeft = VIEWPORT_GAP_PX
	const boundaryRight = viewportWidth - VIEWPORT_GAP_PX
	const boundaryTop = VIEWPORT_GAP_PX
	const boundaryBottom = viewportHeight - VIEWPORT_GAP_PX
	const boundaryHeight = Math.max(1, boundaryBottom - boundaryTop)
	const maxWidth = Math.max(1, boundaryRight - boundaryLeft)
	const width = Math.min(triggerRect.width, maxWidth)
	const viewportLeft = clamp(triggerRect.left, boundaryLeft, boundaryRight - width)
	const spaceBelow = Math.max(0, boundaryBottom - triggerRect.bottom - TRIGGER_GAP_PX)
	const spaceAbove = Math.max(0, triggerRect.top - boundaryTop - TRIGGER_GAP_PX)
	const opensAbove = spaceBelow < maxHeight && spaceAbove > spaceBelow
	const availableHeight = opensAbove ? spaceAbove : spaceBelow
	const resolvedMaxHeight = Math.min(
		boundaryHeight,
		Math.max(1, Math.min(maxHeight, availableHeight)),
	)
	const rawTop = opensAbove
		? triggerRect.top - resolvedMaxHeight - TRIGGER_GAP_PX
		: triggerRect.bottom + TRIGGER_GAP_PX
	const viewportTop = clamp(rawTop, boundaryTop, boundaryBottom - resolvedMaxHeight)

	return {
		position: 'fixed',
		left: viewportLeft,
		top: viewportTop,
		width,
		maxHeight: resolvedMaxHeight,
		zIndex: 70,
		pointerEvents: 'auto',
	}
}

/** Position a body-portaled listbox before paint and during viewport movement. */
export function useFloatingListboxPosition<T extends HTMLElement>(
	open: boolean,
	triggerRef: RefObject<T | null>,
	maxHeight?: number,
): CSSProperties | null {
	const [floatingStyle, setFloatingStyle] = useState<CSSProperties | null>(null)

	useLayoutEffect(() => {
		if (!open) {
			setFloatingStyle(null)
			return
		}

		const updatePosition = () => {
			const triggerElement = triggerRef.current
			if (!triggerElement) {
				setFloatingStyle(null)
				return
			}
			const triggerRect = triggerElement.getBoundingClientRect()
			const viewportWidth = document.documentElement.clientWidth
			const hasLayoutBox = triggerRect.width > 0 || triggerRect.height > 0
			const triggerIsVisible =
				!hasLayoutBox ||
				(triggerRect.bottom > 0 &&
					triggerRect.top < window.innerHeight &&
					triggerRect.right > 0 &&
					triggerRect.left < viewportWidth)
			setFloatingStyle(
				triggerIsVisible
					? getFloatingListboxStyle({
							triggerElement,
							...(maxHeight === undefined ? {} : { maxHeight }),
						})
					: null,
			)
		}

		updatePosition()
		window.addEventListener('scroll', updatePosition, true)
		window.addEventListener('resize', updatePosition)
		return () => {
			window.removeEventListener('scroll', updatePosition, true)
			window.removeEventListener('resize', updatePosition)
		}
	}, [maxHeight, open, triggerRef])

	return floatingStyle
}
