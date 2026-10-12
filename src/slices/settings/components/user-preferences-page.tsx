import { useTheme } from '@/providers/theme-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { InlineError } from '@/ui/inline-error'
import { Skeleton } from '@/ui/skeleton'
import { ThemeSegmented } from '@/ui/theme-segmented'
import { useOrganizationSettings, useUserSettings } from '../hooks/use-settings'
import { UnsupportedTimeZoneHint } from './unsupported-time-zone-hint'
import { UserTimeZoneForm } from './user-time-zone-form'

export function UserPreferencesPage() {
	// useSettingsSync (in `_authed`) saves every theme change to the account, from here or any toggle.
	const { theme, setTheme } = useTheme()
	const userSettingsQuery = useUserSettings()
	const organizationSettingsQuery = useOrganizationSettings()
	const loadError = userSettingsQuery.error ?? organizationSettingsQuery.error

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Preferencias</h1>
				<p className="text-sm text-muted-foreground">
					Cómo ves la app. Se guardan en tu cuenta y te siguen en cualquier dispositivo.
				</p>
			</div>

			<UnsupportedTimeZoneHint />

			<Card>
				<CardHeader>
					<CardTitle>Apariencia</CardTitle>
					<CardDescription>Elige un tema claro, oscuro o el de tu sistema.</CardDescription>
				</CardHeader>
				<CardContent>
					<ThemeSegmented value={theme} onChange={setTheme} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Zona horaria</CardTitle>
					<CardDescription>
						Las fechas se muestran en esta zona. Si no eliges una, usas la de la organización.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{userSettingsQuery.data && organizationSettingsQuery.data ? (
						<UserTimeZoneForm
							timeZone={userSettingsQuery.data.timeZone}
							organizationTimeZone={organizationSettingsQuery.data.timeZone}
						/>
					) : loadError ? (
						<InlineError
							error={loadError}
							onRetry={() => {
								void userSettingsQuery.refetch()
								void organizationSettingsQuery.refetch()
							}}
						/>
					) : (
						<div className="space-y-4">
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-(--control-height) w-40" />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
