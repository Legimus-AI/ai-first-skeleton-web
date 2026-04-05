import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
	return (
		<textarea
			className={cn(
				'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
				'dark:aether-input-inset dark:border-[rgba(255,255,255,0.08)] dark:focus-visible:border-white dark:focus-visible:shadow-[inset_0_0_8px_rgba(255,255,255,0.1)]',
				className,
			)}
			{...props}
		/>
	)
}
