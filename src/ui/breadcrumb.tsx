import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface BreadcrumbItem {
	label: string
	href?: string
	onClick?: () => void
}

interface BreadcrumbProps {
	items: BreadcrumbItem[]
	className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb" className={cn('mb-4 flex items-center gap-1 text-sm', className)}>
			{items.map((item, index) => {
				const isLast = index === items.length - 1
				return (
					<span key={item.label} className="flex items-center gap-1">
						{index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
						{isLast ? (
							<span className="font-medium text-foreground">{item.label}</span>
						) : item.onClick ? (
							<button
								type="button"
								onClick={item.onClick}
								className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
							>
								{item.label}
							</button>
						) : item.href ? (
							<a
								href={item.href}
								className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
							>
								{item.label}
							</a>
						) : (
							<span className="text-muted-foreground">{item.label}</span>
						)}
					</span>
				)
			})}
		</nav>
	)
}
