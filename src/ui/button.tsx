import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 aether-squish focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-foreground dark:text-background dark:border dark:border-[rgba(255,255,255,0.15)] dark:hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-[rgba(255,255,255,0.15)] dark:bg-transparent dark:text-foreground dark:hover:bg-foreground dark:hover:text-background',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				sm: 'h-8 rounded-lg px-3 text-xs',
				md: 'h-10 px-4 py-2',
				lg: 'h-12 rounded-lg px-6 text-base',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: { variant: 'primary', size: 'md' },
	},
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		loading?: boolean
	}

export function Button({
	className,
	variant,
	size,
	loading,
	disabled,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ variant, size }), className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
			{children}
		</button>
	)
}
