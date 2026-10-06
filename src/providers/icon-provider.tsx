import { IconContext } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { ICON_WEIGHT } from '@/ui/icons'

const iconDefaults = { weight: ICON_WEIGHT }

/** Applies the identity's icon weight (src/ui/icons.ts) to every icon below it. */
export function IconProvider({ children }: { children: ReactNode }) {
	return <IconContext value={iconDefaults}>{children}</IconContext>
}
