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
				'rounded-lg bg-muted dark:bg-[rgba(255,255,255,0.06)]',
				shimmer
					? 'motion-safe:animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] dark:from-[rgba(255,255,255,0.06)] dark:via-[rgba(255,255,255,0.02)] dark:to-[rgba(255,255,255,0.06)]'
					: 'motion-safe:animate-pulse',
				className,
			)}
			{...props}
		/>
	)
}
