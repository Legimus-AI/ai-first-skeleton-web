import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium transition-colors',
	{
		variants: {
			variant: {
				default: 'bg-primary/10 text-primary',
				secondary: 'bg-secondary text-secondary-foreground',
				destructive: 'bg-destructive/10 text-destructive',
				success: 'bg-success/10 text-success',
				warning: 'bg-warning/10 text-warning',
				info: 'bg-info/10 text-info',
				outline: 'border-border text-foreground',
			},
		},
		defaultVariants: { variant: 'default' },
	},
)

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
