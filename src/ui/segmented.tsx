import type { AppIcon } from '@/ui/icons'
import { cn } from '@/utils/cn'

/** `[value, label]`, or `[value, label, icon]` for an icon-only option named by its label. */
export type SegmentedOption<Value extends string> = readonly [Value, string, AppIcon?]

interface SegmentedProps<Value extends string> {
	legend: string
	value: Value
	onChange: (value: Value) => void
	options: readonly SegmentedOption<Value>[]
	/** Keeps the legend for screen readers only, when the surrounding UI already names the choice. */
	hideLegend?: boolean
}

/** Pick one of a few options (2-5): a pill track with the chosen option raised. */
export function Segmented<Value extends string>({
	legend,
	value,
	onChange,
	options,
	hideLegend = false,
}: SegmentedProps<Value>) {
	return (
		<fieldset>
			<legend className={cn('text-sm font-medium', hideLegend && 'sr-only')}>{legend}</legend>
			<div className={cn('inline-flex gap-0.5 rounded-button bg-muted p-1', !hideLegend && 'mt-1')}>
				{options.map(([optionValue, optionLabel, OptionIcon]) => (
					<button
						key={optionValue}
						type="button"
						aria-pressed={value === optionValue}
						aria-label={OptionIcon ? optionLabel : undefined}
						onClick={() => onChange(optionValue)}
						className={cn(
							'inline-flex min-h-11 items-center justify-center rounded-button text-sm transition-[background-color,color,box-shadow] duration-150 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-9',
							OptionIcon ? 'min-w-11 sm:min-w-9' : 'px-4',
							value === optionValue
								? 'bg-card font-medium text-foreground shadow-control'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{OptionIcon ? <OptionIcon className="h-4 w-4" /> : optionLabel}
					</button>
				))}
			</div>
		</fieldset>
	)
}
