import type { ApiKey } from '@repo/shared'
import { Trash2 } from 'lucide-react'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { formatDate, formatRelative } from '@/utils/format-date'
import { describeScopes } from '../hooks/use-api-keys'

export function buildApiKeyColumns(onDelete: (id: string) => void): Column<ApiKey>[] {
	return [
		{
			key: 'name',
			label: 'Clave',
			render: (key) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground break-words">{key.name}</p>
					<p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}...</p>
				</div>
			),
		},
		{
			key: 'scopes',
			label: 'Permisos',
			className: 'hidden sm:table-cell',
			render: (key) => (
				<span className="text-sm text-muted-foreground">{describeScopes(key.scopes)}</span>
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
