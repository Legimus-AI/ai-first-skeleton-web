import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/utils/cn'

const options = [
	{ value: 'light', icon: Sun, label: 'Claro' },
	{ value: 'dark', icon: Moon, label: 'Oscuro' },
	{ value: 'system', icon: Monitor, label: 'Sistema' },
] as const

interface ThemeSegmentedProps {
	value: string
	onChange: (value: string) => void
}

export function ThemeSegmented({ value, onChange }: ThemeSegmentedProps) {
	return (
		<div className="flex items-center gap-0.5 rounded-lg bg-muted p-1">
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					aria-pressed={value === opt.value}
					aria-label={opt.label}
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						onChange(opt.value)
					}}
					className={cn(
						'flex flex-1 items-center justify-center rounded-md p-1.5 transition-all duration-150',
						value === opt.value
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					<opt.icon className="h-4 w-4" />
				</button>
			))}
		</div>
	)
}
