import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, KeyRound } from 'lucide-react'
import type { ListParams } from '@/lib/use-query-params'
import { DEFAULT_LIST_PARAMS } from '@/lib/use-query-params'

// ─── Navigation Config ───────────────────────────────────────────────────────
// Main app navigation shown in the sidebar / navbar.
// Account items (Profile, Sign out) live in the UserDropdown.
// Architecture tests (INV-104) verify every CRUD slice has a nav entry.

export interface NavItem {
	label: string
	to: string
	icon: LucideIcon
	group: string
	/** Search params for list routes. Omit for non-list routes. */
	search?: ListParams
	/** Route prefix used for active state detection. Defaults to `to`. */
	activePrefix?: string
}

export const navItems: NavItem[] = [
	// ─── Menu ─────────────────────────────────────────────────────────────────
	{
		label: 'Tareas',
		to: '/todos',
		icon: CheckCircle2,
		group: 'Menu',
		search: DEFAULT_LIST_PARAMS,
	},
	// ─── Sistema ──────────────────────────────────────────────────────────────
	{
		label: 'Claves API',
		to: '/api-keys',
		icon: KeyRound,
		group: 'Sistema',
	},
]
