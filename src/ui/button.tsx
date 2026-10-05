import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from '@/ui/icons'
import { cn } from '@/utils/cn'

export const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-button text-sm font-medium transition-[transform,background-color,color,opacity] duration-150 ease-standard active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-card hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				sm: 'h-8 px-3 text-xs',
				md: 'h-(--control-height) px-4',
				lg: 'h-12 px-6 text-base',
				icon: 'h-(--control-height) w-(--control-height)',
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
			{loading && <Spinner className="mr-1.5 h-4 w-4 animate-spin" />}
			{children}
		</button>
	)
}
