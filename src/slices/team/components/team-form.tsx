import { zodResolver } from '@hookform/resolvers/zod'
import { inviteMemberSchema } from '@repo/shared'
import { useEffect } from 'react'
import { type UseFormSetError, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'

type InviteMemberInput = z.input<typeof inviteMemberSchema>

interface TeamFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** `setError` lets the caller show server field errors (e.g. a taken email) under the inputs. */
	onSubmit: (data: InviteMemberInput, setError: UseFormSetError<InviteMemberInput>) => void
	isPending: boolean
}

export function TeamForm({ open, onOpenChange, onSubmit, isPending }: TeamFormProps) {
	const form = useForm<InviteMemberInput>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: { email: '', name: '', role: 'user' },
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on open
	useEffect(() => {
		if (open) form.reset({ email: '', name: '', role: 'user' })
	}, [open])

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Invitar miembro"
			description="Le enviaremos un email con un enlace para crear su contraseña."
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
					<label htmlFor="invite-name" className="text-sm font-medium text-foreground">
						Nombre
					</label>
					<Input
						id="invite-name"
						placeholder="Nombre completo"
						{...form.register('name')}
						aria-invalid={!!form.formState.errors.name}
					/>
					{form.formState.errors.name && (
						<p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
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
