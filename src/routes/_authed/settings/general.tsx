import { grantsPermission, rolePermissions } from '@repo/shared'
import { createFileRoute } from '@tanstack/react-router'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { OrganizationSettingsPage } from '@/slices/settings/components/organization-settings-page'

// The `_authed` loader already loaded the organization's settings.
export const Route = createFileRoute('/_authed/settings/general')({
	context: () => ({ layout: 'narrow' as const }),
	component: GeneralSettingsRoutePage,
})

// Members reach this page by URL only (the menu hides it): they see the values, read-only.
function GeneralSettingsRoutePage() {
	const { data: user } = useCurrentUser()
	const canEdit = !!user && grantsPermission(rolePermissions(user.role), 'organization:write')
	return <OrganizationSettingsPage canEdit={canEdit} />
}
