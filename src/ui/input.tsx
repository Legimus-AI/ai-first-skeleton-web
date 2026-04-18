import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	error?: boolean
	success?: boolean
}

export function Input({
	className,
	error,
	success,
	'aria-describedby': ariaDescribedBy,
	...props
}: InputProps) {
	return (
		<input
			aria-invalid={error || undefined}
			aria-describedby={ariaDescribedBy}
			className={cn(
				'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
				error &&
					'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
				success && 'border-success focus-visible:border-success focus-visible:ring-success/20',
				className,
			)}
			{...props}
		/>
	)
}
