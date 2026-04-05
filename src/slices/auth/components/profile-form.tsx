import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateProfile, type User, updateProfileSchema } from '@repo/shared'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

interface ProfileFormProps {
	user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
	const { refetch } = useCurrentUser()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<UpdateProfile>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user.name ?? '',
		},
	})

	async function onSubmit(data: UpdateProfile) {
		try {
			const res = await api.patch('/api/v1/auth/me', data)
			await throwIfNotOk(res)
			await refetch()
			toast.success('Profile updated', {
				description: 'Your changes have been saved.',
			})
		} catch (error) {
			toast.error('Failed to update profile', {
				description: error instanceof Error ? error.message : 'Please try again.',
			})
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

			<Button type="submit" disabled={isSubmitting || !isDirty}>
				{isSubmitting ? 'Saving...' : 'Save changes'}
			</Button>
		</form>
	)
}
