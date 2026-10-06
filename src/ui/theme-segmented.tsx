import type { Theme } from '@/providers/theme-provider'
import { Monitor, Moon, Sun } from '@/ui/icons'
import { Segmented, type SegmentedOption } from '@/ui/segmented'

const themeOptions: readonly SegmentedOption<Theme>[] = [
	['light', 'Claro', Sun],
	['dark', 'Oscuro', Moon],
	['system', 'Sistema', Monitor],
]

interface ThemeSegmentedProps {
	value: Theme
	onChange: (value: Theme) => void
}

export function ThemeSegmented({ value, onChange }: ThemeSegmentedProps) {
	return (
		<Segmented legend="Tema" hideLegend value={value} onChange={onChange} options={themeOptions} />
	)
}
