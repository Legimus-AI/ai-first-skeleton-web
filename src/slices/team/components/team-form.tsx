import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { type UseFormSetError, useForm } from 'react-hook-form'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { type InviteMemberForm, inviteMemberFormSchema } from '../team-form-schema'

interface TeamFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** `setError` lets the caller show a server error (e.g. already a member) under the email. */
	onSubmit: (data: InviteMemberForm, setError: UseFormSetError<InviteMemberForm>) => void
	isPending: boolean
}

const EMPTY_INVITE: InviteMemberForm = { email: '', role: 'user' }

export function TeamForm({ open, onOpenChange, onSubmit, isPending }: TeamFormProps) {
	const form = useForm<InviteMemberForm>({
		resolver: zodResolver(inviteMemberFormSchema),
		defaultValues: EMPTY_INVITE,
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on open
	useEffect(() => {
		if (open) form.reset(EMPTY_INVITE)
	}, [open])

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Invitar miembro"
			description="Le enviaremos un email con un enlace para unirse al equipo."
			onSubmit={form.handleSubmit((data) => onSubmit(data, form.setError))}
			isPending={isPending}
			submitLabel="Enviar invitación"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="invite-email" className="text-sm font-medium text-foreground">
						Email
					</label>
					<Input
						id="invite-email"
						type="email"
						placeholder="nombre@empresa.com"
						{...form.register('email')}
						aria-invalid={!!form.formState.errors.email}
					/>
					{form.formState.errors.email && (
						<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label htmlFor="invite-role" className="text-sm font-medium text-foreground">
						Rol
					</label>
					<Select id="invite-role" {...form.register('role')}>
						<option value="admin">Administrador: acceso total</option>
						<option value="user">Miembro: usa la app, no gestiona el equipo</option>
					</Select>
				</div>
			</div>
		</FormDialog>
	)
}
