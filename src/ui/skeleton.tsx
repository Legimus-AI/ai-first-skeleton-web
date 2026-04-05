import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Skeleton({
	className,
	shimmer,
	...props
}: HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
	return (
		<div
			className={cn(
				'rounded-md bg-muted',
				shimmer
					? 'motion-safe:animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]'
					: 'motion-safe:animate-pulse',
				className,
			)}
			{...props}
		/>
	)
}
