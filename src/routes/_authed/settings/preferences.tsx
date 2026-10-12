import { createFileRoute } from '@tanstack/react-router'
import { UserPreferencesPage } from '@/slices/settings/components/user-preferences-page'

// The `_authed` loader already loaded both settings documents.
export const Route = createFileRoute('/_authed/settings/preferences')({
	context: () => ({ layout: 'narrow' as const }),
	component: UserPreferencesPage,
})
