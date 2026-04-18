import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const statusBadgeVariants = cva(
	'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
	{
		variants: {
			status: {
				active: 'bg-primary/10 text-primary',
				inactive: 'bg-muted text-muted-foreground',
				warning: 'bg-accent text-accent-foreground',
				error: 'bg-destructive/10 text-destructive',
				processing: 'bg-secondary text-secondary-foreground',
			},
		},
		defaultVariants: { status: 'active' },
	},
)

const dotVariants: Record<string, string> = {
	active: 'bg-primary',
	inactive: 'bg-muted-foreground/50',
	warning: 'bg-accent-foreground',
	error: 'bg-destructive',
	processing: 'bg-secondary-foreground',
}

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
	label: string
	className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
	const dotColor = dotVariants[status ?? 'active'] ?? 'bg-muted-foreground'
	return (
		<span className={cn(statusBadgeVariants({ status }), className)}>
			<span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
			{label}
		</span>
	)
}
