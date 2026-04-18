import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

export function Select({ className, children, ...props }: ComponentPropsWithoutRef<'select'>) {
	return (
		<div className="relative">
			<select
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
				<svg
					className="h-4 w-4 text-muted-foreground opacity-50"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
				</svg>
			</div>
		</div>
	)
}
