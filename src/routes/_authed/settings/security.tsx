import { createFileRoute } from '@tanstack/react-router'
import { ChangeEmailCard } from '@/slices/auth/components/change-email-card'
import { ChangePasswordCard } from '@/slices/auth/components/change-password-card'
import { DeleteAccountCard } from '@/slices/auth/components/delete-account-card'
import { ExportDataCard } from '@/slices/auth/components/export-data-card'
import { SessionsCard } from '@/slices/auth/components/sessions-card'

export const Route = createFileRoute('/_authed/settings/security')({
	context: () => ({ layout: 'narrow' as const }),
	component: SettingsSecurityPage,
})

function SettingsSecurityPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Seguridad</h1>
				<p className="text-sm text-muted-foreground">Cómo proteges el acceso a tu cuenta.</p>
			</div>

			<ChangePasswordCard />
			<ChangeEmailCard />
			<SessionsCard />
			<ExportDataCard />
			<DeleteAccountCard />
		</div>
	)
}
