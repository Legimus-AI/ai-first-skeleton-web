import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	error?: boolean
}

export function Input({ className, error, ...props }: InputProps) {
	return (
		<input
			className={cn(
				'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				error && 'border-destructive',
				className,
			)}
			{...props}
		/>
	)
}
