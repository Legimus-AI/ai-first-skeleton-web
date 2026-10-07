import { zodResolver } from '@hookform/resolvers/zod'
import {
	type CreateApiKey,
	createApiKeySchema,
	grantsPermission,
	rolePermissions,
} from '@repo/shared'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setFieldErrors } from '@/services/api-error'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog'
import { FadeIn } from '@/ui/fade-in'
import { Key, Plus } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Input } from '@/ui/input'
import {
	API_KEY_SCOPE_PRESETS,
	type ApiKeyScopePresetId,
	useApiKeys,
	useCreateApiKey,
	useDeleteApiKey,
} from '../hooks/use-api-keys'
import { useCurrentUser } from '../hooks/use-auth'
import { buildApiKeyColumns } from './api-key-columns'
import { ConnectedApps } from './connected-apps'
import { NewApiKeyNotice } from './new-api-key-notice'

export function ApiKeysPage() {
	const { data: keys, isLoading, error, refetch } = useApiKeys()
	const { data: user } = useCurrentUser()
	const createApiKey = useCreateApiKey()
	const deleteApiKey = useDeleteApiKey()
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showCreate, setShowCreate] = useState(false)
	const [newRawKey, setNewRawKey] = useState<string | null>(null)
	const [scopePreset, setScopePreset] = useState<ApiKeyScopePresetId>('read')
	// A key can never exceed its creator: "Acceso total" is offered only to roles holding `full`.
	const canGrantFull = user ? grantsPermission(rolePermissions(user.role), 'full') : false
	const scopePresets = API_KEY_SCOPE_PRESETS.filter((p) => p.id !== 'full' || canGrantFull)

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors: formErrors },
	} = useForm<CreateApiKey>({
		resolver: zodResolver(createApiKeySchema),
	})

	const columns = useMemo(() => buildApiKeyColumns(setDeleteId), [])

	const onSubmit = (input: CreateApiKey) => {
		const scopes = API_KEY_SCOPE_PRESETS.find((p) => p.id === scopePreset)?.scopes ?? []
		createApiKey.mutate(
			{ ...input, scopes: [...scopes] },
			{
				onSuccess: (data) => {
					setNewRawKey(data.rawKey)
					setShowCreate(false)
					setScopePreset('read')
					reset()
				},
				onError: (mutationError) => setFieldErrors(mutationError, setError),
			},
		)
	}

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Claves API"
				description="Crea y gestiona claves para acceso programático a la plataforma."
				action={
					<Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
						<Plus className="mr-1.5 h-4 w-4" />
						Crear clave
					</Button>
				}
			/>

			{/* Newly created key banner, with how an agent connects with it */}
			{newRawKey && <NewApiKeyNotice rawKey={newRawKey} onClose={() => setNewRawKey(null)} />}

			{error ? (
				<InlineError error={error} onRetry={() => void refetch()} />
			) : (
				<div className="rounded-surface bg-card shadow-surface">
					<DataTable
						data={keys ?? []}
						columns={columns}
						getId={(key) => key.id}
						isLoading={isLoading}
						emptyMessage="Sin claves API. Crea una para comenzar."
						emptyIcon={<Key className="h-6 w-6 text-muted-foreground" />}
						emptyAction={
							<Button size="sm" onClick={() => setShowCreate(true)}>
								<Plus className="mr-1.5 h-4 w-4" />
								Crear clave
							</Button>
						}
					/>
				</div>
			)}

			<ConnectedApps />

			{/* Create dialog */}
			<Dialog open={showCreate} onOpenChange={setShowCreate}>
				<DialogContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Nueva clave API</DialogTitle>
							<DialogDescription>
								Elige qué podrá hacer. Nunca podrá hacer más que tu cuenta.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-5 py-6">
							<div className="space-y-2">
								<label htmlFor="key-name" className="text-sm font-medium text-foreground">
									Nombre descriptivo
								</label>
								<Input
									id="key-name"
									{...register('name')}
									placeholder="ej. Producción, Script de pruebas"
									aria-invalid={!!formErrors.name}
								/>
								{formErrors.name && (
									<p className="text-xs text-destructive">{formErrors.name.message}</p>
								)}
							</div>
							<fieldset className="space-y-2">
								<legend className="mb-2 text-sm font-medium text-foreground">Permisos</legend>
								{scopePresets.map((preset) => (
									<label
										key={preset.id}
										className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
									>
										<input
											type="radio"
											name="scope-preset"
											checked={scopePreset === preset.id}
											onChange={() => setScopePreset(preset.id)}
											className="mt-0.5 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
										<span className="min-w-0">
											<span className="block text-sm font-medium text-foreground">
												{preset.label}
											</span>
											<span className="block text-xs text-muted-foreground">
												{preset.description}
											</span>
										</span>
									</label>
								))}
							</fieldset>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowCreate(false)}
								className="text-muted-foreground"
							>
								Cancelar
							</Button>
							<Button type="submit" loading={createApiKey.isPending}>
								Crear clave
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation */}
			<ConfirmDelete
				open={deleteId !== null}
				onOpenChange={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId)
						deleteApiKey.mutate(deleteId, {
							onSettled: () => setDeleteId(null),
						})
				}}
				title="¿Revocar clave API?"
				confirmLabel="Revocar"
				description="Esta acción no se puede deshacer. Las aplicaciones que usen esta clave perderán acceso inmediatamente."
				isPending={deleteApiKey.isPending}
			/>
		</FadeIn>
	)
}
