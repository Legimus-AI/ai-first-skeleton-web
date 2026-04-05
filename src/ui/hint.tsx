import { AlertCircle, Info, Lightbulb, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type HintVariant = 'info' | 'warning' | 'tip'

const variants: Record<HintVariant, { icon: LucideIcon; classes: string }> = {
	info: {
		icon: Info,
		classes: 'border-border/50 bg-muted/30 text-muted-foreground',
	},
	warning: {
		icon: AlertCircle,
		classes: 'border-warning/20 bg-warning/5 text-warning-foreground',
	},
	tip: {
		icon: Lightbulb,
		classes: 'border-primary/20 bg-primary/5 text-muted-foreground',
	},
}

interface HintProps {
	children: ReactNode
	variant?: HintVariant
	className?: string
}

/** Contextual hint block for inline help, tips, and warnings. */
export function Hint({ children, variant = 'info', className }: HintProps) {
	const { icon: Icon, classes } = variants[variant]
	return (
		<div className={cn('flex gap-2.5 rounded-lg border px-4 py-3 text-xs', classes, className)}>
			<Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
			<div>{children}</div>
		</div>
	)
}
