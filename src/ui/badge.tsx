import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary/10 text-primary dark:bg-primary/8 dark:text-primary/90',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground dark:bg-[rgba(255,255,255,0.06)] dark:text-muted-foreground',
				destructive:
					'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/8 dark:text-destructive/90',
				success:
					'border-transparent bg-success/10 text-success dark:bg-success/8 dark:text-success/90',
				warning:
					'border-transparent bg-warning/15 text-warning-foreground dark:bg-warning/8 dark:text-warning/90',
				info: 'border-transparent bg-info/10 text-info dark:bg-info/8 dark:text-info/90',
				outline: 'text-foreground dark:border-[rgba(255,255,255,0.12)] dark:text-muted-foreground',
			},
		},
		defaultVariants: { variant: 'default' },
	},
)

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
