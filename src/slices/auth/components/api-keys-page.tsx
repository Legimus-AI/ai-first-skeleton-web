import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateApiKey, createApiKeySchema } from '@repo/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { locale } from '@/env'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Skeleton } from '@/ui/skeleton'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../hooks/use-api-keys'

export function ApiKeysPage() {
	const { data: keys, isLoading, error } = useApiKeys()
	const createApiKey = useCreateApiKey()
	const deleteApiKey = useDeleteApiKey()
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [newRawKey, setNewRawKey] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateApiKey>({
		resolver: zodResolver(createApiKeySchema),
	})

	const onSubmit = (input: CreateApiKey) => {
		createApiKey.mutate(input, {
			onSuccess: (data) => {
				setNewRawKey(data.rawKey)
				reset()
			},
		})
	}

	const confirmDelete = () => {
		if (deleteId) {
			deleteApiKey.mutate(deleteId)
			setDeleteId(null)
		}
	}

	const formatDate = (date: string) => new Date(date).toLocaleDateString(locale)

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text)
		toast.success('Copied to clipboard')
	}

	if (isLoading)
		return (
			<div className="space-y-6">
				{/* Heading + description */}
				<Skeleton className="h-7 w-32" />
				<Skeleton className="h-4 w-full" />

				{/* Create form */}
				<div className="flex gap-2">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-20" />
				</div>

				{/* Key list */}
				<div className="divide-y divide-border rounded-md border border-border">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={`skeleton-${i.toString()}`} className="flex items-center gap-3 px-4 py-3">
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-3 w-40" />
							</div>
							<Skeleton className="h-8 w-16" />
						</div>
					))}
				</div>
			</div>
		)
	if (error) return <p className="text-destructive">Error: {error.message}</p>

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold text-foreground">API Keys</h2>
			<p className="text-sm text-muted-foreground">
				Create API keys to authenticate programmatic access. Keys use the same permissions as your
				account.
			</p>

			{/* Create form */}
			<form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
				<Input
					{...register('name')}
					placeholder="Key name (e.g. Production)"
					error={!!errors.name}
				/>
				<Button type="submit" disabled={createApiKey.isPending}>
					{createApiKey.isPending ? 'Creating...' : 'Create'}
				</Button>
			</form>
			{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}

			{/* Newly created key (shown once) */}
			{newRawKey && (
				<div className="rounded-md border border-border bg-accent/50 p-4 space-y-2">
					<p className="text-sm font-medium text-foreground">
						Your new API key (copy it now — it won't be shown again):
					</p>
					<div className="flex items-center gap-2">
						<code className="flex-1 break-all rounded bg-background p-2 text-xs font-mono text-foreground border border-border">
							{newRawKey}
						</code>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => void copyToClipboard(newRawKey)}
						>
							Copy
						</Button>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setNewRawKey(null)}
						className="text-muted-foreground"
					>
						Dismiss
					</Button>
				</div>
			)}

			{/* Key list */}
			<ul className="divide-y divide-border rounded-md border border-border">
				{keys?.map((key) => (
					<li key={key.id} className="flex items-center gap-3 px-4 py-3">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-foreground">{key.name}</p>
							<p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}...</p>
							<p className="text-xs text-muted-foreground">
								Created {formatDate(key.createdAt)}
								{key.lastUsedAt && ` · Last used ${formatDate(key.lastUsedAt)}`}
								{key.expiresAt && ` · Expires ${formatDate(key.expiresAt)}`}
							</p>
						</div>
						<Button
							variant="destructive"
							size="sm"
							type="button"
							onClick={() => setDeleteId(key.id)}
						>
							Revoke
						</Button>
					</li>
				))}
				{keys?.length === 0 && (
					<li className="px-4 py-8 text-center text-sm text-muted-foreground">
						No API keys yet. Create one above.
					</li>
				)}
			</ul>

			{/* Usage hint */}
			<div className="rounded-md border border-border bg-accent/30 p-4 space-y-2">
				<p className="text-sm font-medium text-foreground">Usage</p>
				<code className="block rounded bg-background p-2 text-xs font-mono text-muted-foreground border border-border">
					curl -H "Authorization: Bearer ak_live_..." {window.location.origin}/api/todos
				</code>
			</div>

			{/* Delete confirmation */}
			<AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke API key?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. Any applications using this key will lose access
							immediately.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Revoke
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
