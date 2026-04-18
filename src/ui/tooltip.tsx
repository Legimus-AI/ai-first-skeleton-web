import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export const TooltipProvider = TooltipPrimitive.Provider
export const TooltipRoot = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
	className,
	sideOffset = 4,
	...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Content
			sideOffset={sideOffset}
			className={cn(
				'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
				className,
			)}
			{...props}
		/>
	)
}

/** Shorthand: wraps children with a tooltip. */
export function Tooltip({
	children,
	content,
	side,
}: {
	children: ReactNode
	content: string
	side?: 'top' | 'right' | 'bottom' | 'left'
}) {
	return (
		<TooltipRoot>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent {...(side ? { side } : {})}>{content}</TooltipContent>
		</TooltipRoot>
	)
}
