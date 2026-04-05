import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tooltip } from '@/ui/tooltip'

interface InfoTooltipProps {
	content: string
	side?: 'top' | 'right' | 'bottom' | 'left'
	className?: string
}

/** Small info icon that shows a tooltip on hover — like n8n's inline help. */
export function InfoTooltip({ content, side = 'top', className }: InfoTooltipProps) {
	return (
		<Tooltip content={content} side={side}>
			<span
				className={cn(
					'inline-flex cursor-help text-muted-foreground/50 transition-colors hover:text-muted-foreground',
					className,
				)}
			>
				<Info className="h-3.5 w-3.5" />
			</span>
		</Tooltip>
	)
}
