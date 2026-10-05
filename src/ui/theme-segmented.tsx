import { Monitor, Moon, Sun } from '@/ui/icons'
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
		<div className="flex items-center gap-0.5 rounded-button bg-muted p-1">
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
						'flex flex-1 items-center justify-center rounded-button p-1.5 transition-[background-color,color,box-shadow] duration-150 ease-standard',
						value === opt.value
							? 'bg-card text-foreground shadow-control'
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					<opt.icon className="h-4 w-4" />
				</button>
			))}
		</div>
	)
}
