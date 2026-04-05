import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateProfile, type User, updateProfileSchema } from '@repo/shared'
import { useForm } from 'react-hook-form'
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
		formState: { errors, isDirty },
	} = useForm<UpdateProfile>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user.name ?? '',
		},
	})

	return (
		<form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="profile-email" className="text-sm font-medium text-foreground">
					Email
				</label>
				<Input id="profile-email" value={user.email} disabled className="bg-muted" />
				<p className="text-xs text-muted-foreground">Email cannot be changed.</p>
			</div>

			<div className="space-y-2">
				<label htmlFor="profile-name" className="text-sm font-medium text-foreground">
					Name
				</label>
				<Input id="profile-name" placeholder="Your name" {...register('name')} />
				{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
			</div>

			<Button type="submit" disabled={updateProfile.isPending || !isDirty}>
				{updateProfile.isPending ? 'Saving...' : 'Save changes'}
			</Button>
		</form>
	)
}
