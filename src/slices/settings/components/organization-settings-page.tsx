import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { InlineError } from '@/ui/inline-error'
import { Skeleton } from '@/ui/skeleton'
import { useOrganizationSettings } from '../hooks/use-settings'
import { OrganizationSettingsForm } from './organization-settings-form'
import { UnsupportedTimeZoneHint } from './unsupported-time-zone-hint'

interface OrganizationSettingsPageProps {
	/** Holds `organization:write`; the route decides it from the signed-in user's role. */
	canEdit: boolean
}

export function OrganizationSettingsPage({ canEdit }: OrganizationSettingsPageProps) {
	const { data: settings, error, refetch } = useOrganizationSettings()

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">General</h1>
				<p className="text-sm text-muted-foreground">Ajustes que aplican a toda la organización.</p>
			</div>

			<UnsupportedTimeZoneHint />

			<Card>
				<CardHeader>
					<CardTitle>Fechas</CardTitle>
					<CardDescription>
						La zona horaria y el formato con los que todo el equipo ve las fechas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{settings ? (
						<OrganizationSettingsForm settings={settings} canEdit={canEdit} />
					) : error ? (
						<InlineError error={error} onRetry={() => void refetch()} />
					) : (
						<div className="space-y-4">
							<Skeleton className="h-26 w-full" />
							<Skeleton className="h-26 w-full" />
							<Skeleton className="h-(--control-height) w-40" />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
