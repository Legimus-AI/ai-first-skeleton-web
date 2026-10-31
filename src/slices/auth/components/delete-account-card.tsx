import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { FormDialog } from '@/ui/form-dialog'
import { authErrorMessage, isWrongPassword } from '../auth-error'
import { type DeleteAccountForm, deleteAccountFormSchema } from '../auth-form-schemas'
import { useDeleteAccount } from '../hooks/use-account'
import { AuthFormField } from './auth-form-field'

export function DeleteAccountCard() {
	const deleteAccount = useDeleteAccount()
	const [showConfirm, setShowConfirm] = useState(false)
	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<DeleteAccountForm>({ resolver: zodResolver(deleteAccountFormSchema) })

	const closeConfirm = (open: boolean) => {
		setShowConfirm(open)
		if (!open) reset()
	}

	const onSubmit = ({ password }: DeleteAccountForm) =>
		deleteAccount.mutate(password, {
			onError: (error) => {
				if (isWrongPassword(error)) setError('password', { message: authErrorMessage(error) })
			},
		})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Eliminar cuenta</CardTitle>
				<CardDescription>
					Borra tu cuenta y tus datos personales. Si eres el único miembro de tu organización, ella
					y todo lo que contiene se borran también. No se puede deshacer.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button type="button" variant="destructive" onClick={() => setShowConfirm(true)}>
					Eliminar mi cuenta
				</Button>
			</CardContent>

			<FormDialog
				open={showConfirm}
				onOpenChange={closeConfirm}
				title="¿Eliminar tu cuenta?"
				description="Escribe tu contraseña para confirmar. Esta acción no se puede deshacer. Si entras solo con Google, crea una contraseña primero desde «¿Olvidaste tu contraseña?»."
				onSubmit={handleSubmit(onSubmit)}
				isPending={deleteAccount.isPending}
				submitLabel="Eliminar cuenta"
			>
				<AuthFormField
					id="delete-account-password"
					label="Contraseña"
					type="password"
					placeholder="Tu contraseña"
					registration={register('password')}
					hasError={!!errors.password}
					errorMessage={errors.password?.message}
					autoComplete="current-password"
				/>
			</FormDialog>
		</Card>
	)
}
