import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'
import { getFloatingListboxContainer, useFloatingListboxPosition } from '@/ui/floating-listbox'
import { cn } from '@/utils/cn'

interface FloatingListboxPanelProps<T extends HTMLElement> {
	open: boolean
	triggerRef: RefObject<T | null>
	dropdownRef: RefObject<HTMLDivElement | null>
	listboxId: string | undefined
	maxHeight?: number
	className?: string
	children: ReactNode
	onPointerDownCapture?: HTMLAttributes<HTMLDivElement>['onPointerDownCapture']
}

/** Body-portaled listbox that composes with modal scroll locks. */
export function FloatingListboxPanel<T extends HTMLElement>({
	open,
	triggerRef,
	dropdownRef,
	listboxId,
	maxHeight,
	className,
	children,
	onPointerDownCapture,
}: FloatingListboxPanelProps<T>) {
	const floatingStyle = useFloatingListboxPosition(open, triggerRef, maxHeight)
	if (!open || !floatingStyle) return null

	return createPortal(
		<RemoveScroll noIsolation removeScrollBar={false} allowPinchZoom forwardProps>
			<div
				ref={dropdownRef}
				id={listboxId}
				data-floating-listbox=""
				style={floatingStyle}
				role="listbox"
				onPointerDownCapture={(event) => {
					event.stopPropagation()
					onPointerDownCapture?.(event)
				}}
				className={cn('overflow-y-auto overscroll-contain', className)}
			>
				{children}
			</div>
		</RemoveScroll>,
		getFloatingListboxContainer(triggerRef.current),
	)
}
