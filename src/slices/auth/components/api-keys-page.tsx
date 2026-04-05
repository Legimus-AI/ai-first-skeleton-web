import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateApiKey, createApiKeySchema } from '@repo/shared'
import { KeyRound, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { InlineError } from '@/ui/inline-error'
import { Input } from '@/ui/input'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../hooks/use-api-keys'
import { buildApiKeyColumns } from './api-key-columns'

export function ApiKeysPage() {
	const { data: keys, isLoading, error } = useApiKeys()
	const createApiKey = useCreateApiKey()
	const deleteApiKey = useDeleteApiKey()
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showCreate, setShowCreate] = useState(false)
	const [newRawKey, setNewRawKey] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors: formErrors },
	} = useForm<CreateApiKey>({
		resolver: zodResolver(createApiKeySchema),
	})

	const columns = useMemo(() => buildApiKeyColumns(setDeleteId), [])

	const onSubmit = (input: CreateApiKey) => {
		createApiKey.mutate(input, {
			onSuccess: (data) => {
				setNewRawKey(data.rawKey)
				setShowCreate(false)
				reset()
			},
		})
	}

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text)
		toast.success('Copiado al portapapeles')
	}

	if (error) {
		return <InlineError message={error.message} onRetry={() => globalThis.location.reload()} />
	}

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Claves API"
				description="Crea y gestiona claves para acceso programático a la plataforma."
				action={
					<Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto aether-squish">
						<Plus className="mr-1.5 h-4 w-4" />
						Crear clave
					</Button>
				}
			/>

			{/* Newly created key banner */}
			{newRawKey && (
				<div className="animate-in fade-in slide-in-from-top-2 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
					<div className="space-y-1">
						<p className="text-sm font-medium text-foreground">Tu nueva clave API está lista</p>
						<p className="text-xs text-muted-foreground">
							Cópiala ahora. Por seguridad, no se volverá a mostrar.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<code className="flex-1 break-all rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground">
							{newRawKey}
						</code>
						<Button
							type="button"
							variant="secondary"
							onClick={() => void copyToClipboard(newRawKey)}
						>
							Copiar
						</Button>
					</div>
					<div className="pt-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setNewRawKey(null)}
							className="text-muted-foreground hover:text-foreground"
						>
							Cerrar
						</Button>
					</div>
				</div>
			)}

			<div className="rounded-xl border border-border/50 bg-card shadow-sm">
				<DataTable
					data={keys ?? []}
					columns={columns}
					getId={(key) => key.id}
					isLoading={isLoading}
					emptyMessage="Sin claves API. Crea una para comenzar."
					emptyIcon={<KeyRound className="h-6 w-6 text-muted-foreground" />}
					emptyAction={
						<Button size="sm" onClick={() => setShowCreate(true)}>
							<Plus className="mr-1.5 h-4 w-4" />
							Crear clave
						</Button>
					}
				/>
			</div>

			{/* Create dialog */}
			<Dialog open={showCreate} onOpenChange={setShowCreate}>
				<DialogContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Nueva clave API</DialogTitle>
							<DialogDescription>
								La clave usa los mismos permisos que tu cuenta actual.
							</DialogDescription>
						</DialogHeader>
						<div className="py-6">
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
					if (deleteId) {
						deleteApiKey.mutate(deleteId)
						setDeleteId(null)
					}
				}}
				title="¿Revocar clave API?"
				description="Esta acción no se puede deshacer. Las aplicaciones que usen esta clave perderán acceso inmediatamente."
				isPending={deleteApiKey.isPending}
			/>
		</FadeIn>
	)
}
