import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { setFieldErrors } from '@/services/api-error'
import { Button } from '@/ui/button'
import { useUpdateUserSettings } from '../hooks/use-settings'
import { type UserTimeZoneFormValues, userTimeZoneFormSchema } from '../settings-form-schemas'
import { SettingField } from './setting-field'
import { TimeZoneSelect } from './time-zone-select'

interface UserTimeZoneFormProps {
	/** The person's own zone; `null` follows the organization's. */
	timeZone: string | null
	organizationTimeZone: string
}

export function UserTimeZoneForm({ timeZone, organizationTimeZone }: UserTimeZoneFormProps) {
	const updateSettings = useUpdateUserSettings()
	const {
		control,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isDirty },
	} = useForm<UserTimeZoneFormValues>({
		resolver: zodResolver(userTimeZoneFormSchema),
		defaultValues: { timeZone },
	})

	const saveTimeZone = handleSubmit((values) =>
		updateSettings.mutate(
			{ timeZone: values.timeZone },
			{
				onSuccess: (saved) => reset({ timeZone: saved.timeZone }),
				onError: (error) => setFieldErrors(error, setError),
			},
		),
	)

	return (
		<form onSubmit={saveTimeZone} className="space-y-4">
			<SettingField htmlFor="user-time-zone" label="Zona horaria" error={errors.timeZone?.message}>
				{(ariaDescribedBy) => (
					<Controller
						control={control}
						name="timeZone"
						render={({ field }) => (
							<TimeZoneSelect
								id="user-time-zone"
								name={field.name}
								ref={field.ref}
								value={field.value}
								onBlur={field.onBlur}
								onChange={(event) => field.onChange(event.target.value || null)}
								aria-invalid={!!errors.timeZone}
								aria-describedby={ariaDescribedBy}
							>
								{/* Zone first: a narrow select cuts the end of the label, not the zone. */}
								<option value="">{organizationTimeZone} (la de la organización)</option>
							</TimeZoneSelect>
						)}
					/>
				)}
			</SettingField>

			<Button
				type="submit"
				className="w-full sm:w-auto"
				disabled={!isDirty}
				loading={updateSettings.isPending}
			>
				Guardar cambios
			</Button>
		</form>
	)
}
