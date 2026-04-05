import { zodResolver } from '@hookform/resolvers/zod'
import { type ApiKey, type CreateApiKey, createApiKeySchema } from '@repo/shared'
import { KeyRound, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { locale } from '@/env'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { type Column, DataTable } from '@/ui/data-table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog'
import { InlineError } from '@/ui/inline-error'
import { Input } from '@/ui/input'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../hooks/use-api-keys'

function formatDate(date: string) {
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function formatRelative(date: string) {
	const diff = Date.now() - new Date(date).getTime()
	const minutes = Math.floor(diff / 60_000)
	if (minutes < 1) return 'Hace instantes'
	if (minutes < 60) return `Hace ${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `Hace ${hours}h`
	const days = Math.floor(hours / 24)
	if (days < 30) return `Hace ${days}d`
	return formatDate(date)
}

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

	const columns: Column<ApiKey>[] = [
		{
			key: 'name',
			label: 'Clave',
			render: (key) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">{key.name}</p>
					<p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}...</p>
				</div>
			),
		},
		{
			key: 'createdAt',
			label: 'Creada',
			className: 'hidden md:table-cell',
			render: (key) => (
				<span className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</span>
			),
		},
		{
			key: 'lastUsedAt',
			label: 'Ultimo uso',
			className: 'hidden md:table-cell',
			render: (key) => (
				<span className="text-sm text-muted-foreground">
					{key.lastUsedAt ? formatRelative(key.lastUsedAt) : 'Nunca'}
				</span>
			),
		},
		{
			key: 'expiresAt',
			label: 'Expira',
			className: 'hidden lg:table-cell',
			render: (key) => (
				<span className="text-sm text-muted-foreground">
					{key.expiresAt ? formatDate(key.expiresAt) : 'Nunca'}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-12 text-right',
			render: (key) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						setDeleteId(key.id)
					}}
					aria-label={`Revocar "${key.name}"`}
				>
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			),
		},
	]

	return (
		<div className="space-y-6">
			<CrudPageHeader
				title="Claves API"
				description="Crea y gestiona claves para acceso programatico."
				action={
					<Button onClick={() => setShowCreate(true)}>
						<Plus className="mr-1.5 h-4 w-4" />
						Crear clave
					</Button>
				}
			/>

			{/* Newly created key banner */}
			{newRawKey && (
				<div className="space-y-2 rounded-md border border-border bg-accent/50 p-4">
					<p className="text-sm font-medium text-foreground">
						Tu nueva clave API (copiala ahora — no se mostrara de nuevo):
					</p>
					<div className="flex items-center gap-2">
						<code className="flex-1 break-all rounded border border-border bg-background p-2 font-mono text-xs text-foreground">
							{newRawKey}
						</code>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => void copyToClipboard(newRawKey)}
						>
							Copiar
						</Button>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setNewRawKey(null)}
						className="text-muted-foreground"
					>
						Cerrar
					</Button>
				</div>
			)}

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

			{/* Create dialog */}
			<Dialog open={showCreate} onOpenChange={setShowCreate}>
				<DialogContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Nueva clave API</DialogTitle>
							<DialogDescription>La clave usa los mismos permisos que tu cuenta.</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Input
								{...register('name')}
								placeholder="Nombre (ej. Produccion)"
								aria-label="Nombre de la clave API"
								aria-invalid={!!formErrors.name}
							/>
							{formErrors.name && (
								<p className="mt-1 text-sm text-destructive">{formErrors.name.message}</p>
							)}
						</div>
						<DialogFooter>
							<Button type="submit" loading={createApiKey.isPending}>
								Crear
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
				title="Revocar clave API?"
				description="Esta accion no se puede deshacer. Las aplicaciones que usen esta clave perderan acceso inmediatamente."
				isPending={deleteApiKey.isPending}
			/>
		</div>
	)
}
