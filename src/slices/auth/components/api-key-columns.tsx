import type { ApiKey } from '@repo/shared'
import { Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'

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

export function buildApiKeyColumns(onDelete: (id: string) => void): Column<ApiKey>[] {
	return [
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
			label: 'Último uso',
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
					className="h-8 w-8 text-muted-foreground hover:text-destructive"
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onDelete(key.id)
					}}
					aria-label={`Revocar "${key.name}"`}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			),
		},
	]
}
