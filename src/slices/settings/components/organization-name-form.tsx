import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { useRenameOrganization } from '../hooks/use-settings'
import {
	type OrganizationNameFormValues,
	organizationNameFormSchema,
} from '../settings-form-schemas'

/** Renames the organization; only rendered for people who hold `organization:write`. */
export function OrganizationNameForm() {
	const renameOrganization = useRenameOrganization()
	const { data: user } = useCurrentUser()
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<OrganizationNameFormValues>({
		resolver: zodResolver(organizationNameFormSchema),
		defaultValues: { name: user?.organizationName ?? '' },
	})

	return (
		<form
			onSubmit={handleSubmit(({ name }) =>
				renameOrganization.mutate(name, { onSuccess: () => reset({ name }) }),
			)}
			className="space-y-4"
		>
			<div className="space-y-1.5">
				<label htmlFor="organization-name" className="text-sm font-medium text-foreground">
					Nombre nuevo
				</label>
				<Input
					id="organization-name"
					placeholder="Nombre de tu organización"
					error={!!errors.name}
					{...register('name')}
				/>
				{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
			</div>
			<Button type="submit" loading={renameOrganization.isPending}>
				Cambiar nombre
			</Button>
		</form>
	)
}
