import {
	ORGANIZATION_SETTINGS_DEFAULTS,
	type OrganizationSettings,
	SUPPORTED_LOCALES,
	updateOrganizationSettingsSchema,
} from '@repo/shared'
import { Controller, useForm } from 'react-hook-form'
import { setFieldErrors } from '@/services/api-error'
import { Button } from '@/ui/button'
import { Hint } from '@/ui/hint'
import { Select } from '@/ui/select'
import { useUpdateOrganizationSettings } from '../hooks/use-settings'
import { localeLabel } from '../locale-options'
import { SettingField } from './setting-field'
import { TimeZoneSelect } from './time-zone-select'

// WHY: one entry per key, so a new setting does not compile until "Restablecer" can reset it.
const RESET_PATCH: { [Key in keyof OrganizationSettings]: Record<Key, null> } = {
	timeZone: { timeZone: null },
	locale: { locale: null },
}
const READ_ONLY_HINT_ID = 'organization-settings-read-only'

function isOrganizationSettingKey(key: unknown): key is keyof OrganizationSettings {
	return typeof key === 'string' && key in RESET_PATCH
}

interface OrganizationSettingsFormProps {
	settings: OrganizationSettings
	/** Holds `organization:write`; everyone else sees the values read-only. */
	canEdit: boolean
}

export function OrganizationSettingsForm({ settings, canEdit }: OrganizationSettingsFormProps) {
	const updateSettings = useUpdateOrganizationSettings()
	const {
		control,
		register,
		handleSubmit,
		setError,
		setFocus,
		reset,
		resetField,
		formState: { errors, isDirty },
	} = useForm<OrganizationSettings>({ defaultValues: settings, disabled: !canEdit })

	// Only the changed keys travel: the stored document keeps what the owner chose, nothing more.
	// The patch schema checks only those, so a saved zone this browser lacks never blocks a save.
	const saveOrganizationSettings = handleSubmit((values) => {
		const settingKeys = Object.keys(settings) as (keyof OrganizationSettings)[]
		const changedSettings = Object.fromEntries(
			settingKeys.filter((key) => values[key] !== settings[key]).map((key) => [key, values[key]]),
		)
		const patch = updateOrganizationSettingsSchema.safeParse(changedSettings)
		if (!patch.success) {
			for (const issue of patch.error.issues) {
				const field = issue.path[0]
				// WHY: the patch holds only keys of `settings`; an issue without one is a bug, not input.
				if (!isOrganizationSettingKey(field)) throw patch.error
				setError(field, { message: issue.message })
			}
			return
		}
		updateSettings.mutate(patch.data, {
			onSuccess: (saved) => reset(saved),
			onError: (error) => setFieldErrors(error, setError),
		})
	})

	/** "Restablecer" for a field off its default: saves at once and resets only that field. */
	const restoreDefaultOf = (field: keyof OrganizationSettings, label: string) => {
		if (!canEdit || settings[field] === ORGANIZATION_SETTINGS_DEFAULTS[field]) return undefined
		return {
			label,
			disabled: updateSettings.isPending,
			onClick: () =>
				updateSettings.mutate(RESET_PATCH[field], {
					onSuccess: (saved) => {
						// An unsaved change of the other field stays.
						resetField(field, { defaultValue: saved[field] })
						// The button leaves with the custom value: focus goes to its field (WCAG 2.4.3).
						setFocus(field)
					},
				}),
		}
	}

	const describedBy = canEdit ? undefined : READ_ONLY_HINT_ID

	return (
		<form onSubmit={saveOrganizationSettings} className="space-y-4">
			<SettingField
				htmlFor="organization-time-zone"
				label="Zona horaria"
				description="Las fechas se muestran en esta zona, salvo para quien elija la suya en Preferencias."
				error={errors.timeZone?.message}
				describedBy={describedBy}
				restoreDefault={restoreDefaultOf('timeZone', 'Restablecer la zona horaria')}
			>
				{(ariaDescribedBy) => (
					<Controller
						control={control}
						name="timeZone"
						render={({ field }) => (
							<TimeZoneSelect
								id="organization-time-zone"
								name={field.name}
								ref={field.ref}
								value={field.value}
								disabled={field.disabled}
								onBlur={field.onBlur}
								onChange={(event) => field.onChange(event.target.value)}
								aria-invalid={!!errors.timeZone}
								aria-describedby={ariaDescribedBy}
							/>
						)}
					/>
				)}
			</SettingField>

			<SettingField
				htmlFor="organization-locale"
				label="Formato regional"
				description="Cómo se escriben las fechas. Los textos de la app siguen en español."
				error={errors.locale?.message}
				describedBy={describedBy}
				restoreDefault={restoreDefaultOf('locale', 'Restablecer el formato regional')}
			>
				{(ariaDescribedBy) => (
					<Select
						id="organization-locale"
						aria-invalid={!!errors.locale}
						aria-describedby={ariaDescribedBy}
						{...register('locale')}
					>
						{SUPPORTED_LOCALES.map((locale) => (
							<option key={locale} value={locale}>
								{localeLabel(locale)}
							</option>
						))}
					</Select>
				)}
			</SettingField>

			{canEdit ? (
				<Button
					type="submit"
					className="w-full sm:w-auto"
					disabled={!isDirty}
					loading={updateSettings.isPending}
				>
					Guardar cambios
				</Button>
			) : (
				<Hint id={READ_ONLY_HINT_ID}>
					Solo el propietario o un administrador de la organización puede cambiar esto.
				</Hint>
			)}
		</form>
	)
}
