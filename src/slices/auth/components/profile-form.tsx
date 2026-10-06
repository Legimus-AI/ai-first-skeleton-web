import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateProfile, type User, updateProfileSchema } from '@repo/shared'
import { useForm } from 'react-hook-form'
import { setFieldErrors } from '@/services/api-error'
import { useUpdateProfile } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

interface ProfileFormProps {
	user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
	const updateProfile = useUpdateProfile()

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isDirty },
	} = useForm<UpdateProfile>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user.name ?? '',
		},
	})

	return (
		<form
			onSubmit={handleSubmit((data) =>
				updateProfile.mutate(data, {
					onError: (error) => setFieldErrors(error, setError),
				}),
			)}
			className="space-y-4"
		>
			<div className="space-y-2">
				<label htmlFor="profile-email" className="text-sm font-medium text-foreground">
					Email
				</label>
				<Input id="profile-email" value={user.email} disabled className="bg-muted" />
				<p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
			</div>

			<div className="space-y-2">
				<label htmlFor="profile-name" className="text-sm font-medium text-foreground">
					Nombre
				</label>
				<Input id="profile-name" placeholder="Tu nombre" {...register('name')} />
				{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
			</div>

			<Button type="submit" disabled={!isDirty} loading={updateProfile.isPending}>
				Guardar cambios
			</Button>
		</form>
	)
}
