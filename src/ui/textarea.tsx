import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
	return (
		<textarea
			className={cn(
				'flex min-h-20 w-full rounded-control border border-input bg-background px-3 py-2 text-sm transition-[border-color,box-shadow] duration-150 ease-standard placeholder:text-muted-foreground hover:border-ring/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	)
}
