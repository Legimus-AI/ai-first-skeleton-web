import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, KeyRound, LayoutDashboard, Settings, Users } from 'lucide-react'
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
	/** Optional sub-items for nested navigation. */
	children?: Omit<NavItem, 'group' | 'icon'>[]
}

export const navItems: NavItem[] = [
	// ─── General ──────────────────────────────────────────────────────────────
	{
		label: 'Dashboard',
		to: '/dashboard',
		icon: LayoutDashboard,
		group: 'General',
	},
	// ─── Menu ─────────────────────────────────────────────────────────────────
	{
		label: 'Tareas',
		to: '/todos',
		icon: CheckCircle2,
		group: 'Menu',
		search: DEFAULT_LIST_PARAMS,
	},
	// ─── Administracion ───────────────────────────────────────────────────────
	{
		label: 'Usuarios',
		to: '/users',
		icon: Users,
		group: 'Administracion',
		search: DEFAULT_LIST_PARAMS,
	},
	// ─── Sistema ──────────────────────────────────────────────────────────────
	{
		label: 'Configuracion',
		to: '/settings',
		icon: Settings,
		group: 'Sistema',
		children: [
			{ label: 'General', to: '/settings/general' },
			{ label: 'Seguridad', to: '/settings/security' },
			{ label: 'Notificaciones', to: '/settings/notifications' },
		],
	},
	{
		label: 'Claves API',
		to: '/api-keys',
		icon: KeyRound,
		group: 'Sistema',
	},
]
