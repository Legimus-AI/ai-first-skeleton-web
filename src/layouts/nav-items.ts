import type { ListParams } from '@/hooks/use-query-params'
import { DEFAULT_LIST_PARAMS } from '@/hooks/use-query-params'
import type { AppIcon } from '@/ui/icons'
import {
	CheckCircle,
	FileText,
	LayoutDashboard,
	LayoutGrid,
	MessageSquare,
	Settings,
} from '@/ui/icons'

// ─── Navigation Config ───────────────────────────────────────────────────────
// Main app navigation shown in the sidebar / navbar.
// Account items (Profile, Sign out) live in the UserDropdown.
// Architecture tests (INV-104) verify every CRUD slice has a nav entry.

export interface NavItem {
	label: string
	to: string
	icon: AppIcon
	group: string
	/** Search params for list routes. Omit for non-list routes. */
	search?: ListParams
	/** Route prefix used for active state detection. Defaults to `to`. */
	activePrefix?: string
	/** Marks a reference demo whose data is not saved anywhere. */
	demo?: boolean
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
		icon: CheckCircle,
		group: 'Menú',
		search: DEFAULT_LIST_PARAMS,
	},
	{
		label: 'Tablero',
		to: '/board',
		icon: LayoutGrid,
		group: 'Menú',
		demo: true,
	},
	{
		label: 'Chat',
		to: '/chat',
		icon: MessageSquare,
		group: 'Menú',
		demo: true,
	},
	{
		label: 'Editor',
		to: '/editor',
		icon: FileText,
		group: 'Menú',
		demo: true,
	},
	// ─── Sistema ──────────────────────────────────────────────────────────────
	{
		label: 'Configuración',
		to: '/settings',
		icon: Settings,
		group: 'Sistema',
		children: [
			{ label: 'Equipo', to: '/settings/team', search: DEFAULT_LIST_PARAMS },
			{ label: 'Seguridad', to: '/settings/security' },
			{ label: 'Notificaciones', to: '/settings/notifications' },
			{ label: 'Claves API', to: '/settings/api-keys' },
		],
	},
]
