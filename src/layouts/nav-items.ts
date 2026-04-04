import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, KeyRound, UserCircle } from 'lucide-react'
import type { ListParams } from '@/lib/use-query-params'
import { DEFAULT_LIST_PARAMS } from '@/lib/use-query-params'

// ─── Navigation Config ───────────────────────────────────────────────────────
// Add new entries here when creating a new slice.
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
	// ─── App ──────────────────────────────────────────────────────────────────
	{
		label: 'Todos',
		to: '/todos',
		icon: CheckCircle2,
		group: 'App',
		search: DEFAULT_LIST_PARAMS,
	},
	// ─── System ───────────────────────────────────────────────────────────────
	{
		label: 'API Keys',
		to: '/api-keys',
		icon: KeyRound,
		group: 'System',
	},
	{
		label: 'Profile',
		to: '/profile',
		icon: UserCircle,
		group: 'System',
	},
]
