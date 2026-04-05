import type { Todo } from '@repo/shared'
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react'
import { locale } from '@/env'
import { cn } from '@/lib/cn'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'

function formatRelative(date: string): string {
	const diff = Date.now() - new Date(date).getTime()
	const minutes = Math.floor(diff / 60_000)
	if (minutes < 1) return 'Ahora'
	if (minutes < 60) return `Hace ${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `Hace ${hours}h`
	const days = Math.floor(hours / 24)
	if (days < 7) return `Hace ${days}d`
	return new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

function formatDate(date: string): string {
	return new Date(date).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

interface TodoColumnsOptions {
	onToggle: (item: Todo) => void
	onEdit: (item: Todo) => void
	onDelete: (item: Todo) => void
}

export function buildTodoColumns({
	onToggle,
	onEdit,
	onDelete,
}: TodoColumnsOptions): Column<Todo>[] {
	return [
		{
			key: 'completed',
			label: '',
			className: 'w-8 pr-0',
			render: (item) => (
				<button
					type="button"
					onClick={() => onToggle(item)}
					className="transition-colors duration-150"
					aria-label={`Marcar "${item.title}" como ${item.completed ? 'pendiente' : 'completada'}`}
				>
					{item.completed ? (
						<CheckCircle2 className="h-4.5 w-4.5 text-success" />
					) : (
						<Circle className="h-4.5 w-4.5 text-muted-foreground/40 hover:text-muted-foreground" />
					)}
				</button>
			),
		},
		{
			key: 'title',
			label: 'Titulo',
			sortable: true,
			render: (item) => (
				<span className={cn('text-sm', item.completed && 'text-muted-foreground line-through')}>
					{item.title}
				</span>
			),
		},
		{
			key: 'status',
			label: 'Estado',
			className: 'hidden md:table-cell w-24',
			render: (item) => (
				<Badge variant={item.completed ? 'success' : 'secondary'}>
					{item.completed ? 'Completada' : 'Pendiente'}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			label: 'Creada',
			sortable: true,
			className: 'hidden lg:table-cell w-28',
			render: (item) => (
				<span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
			),
		},
		{
			key: 'updatedAt',
			label: 'Modificada',
			sortable: true,
			className: 'hidden xl:table-cell w-24',
			render: (item) => (
				<span className="text-xs text-muted-foreground">{formatRelative(item.updatedAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-16 text-right',
			render: (item) => (
				<div className="flex justify-end gap-0.5 transition-opacity duration-150 md:opacity-0 md:group-hover/row:opacity-100 md:focus-within:opacity-100">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onEdit(item)
						}}
						aria-label={`Editar "${item.title}"`}
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onDelete(item)
						}}
						aria-label={`Eliminar "${item.title}"`}
					>
						<Trash2 className="h-3.5 w-3.5 text-destructive" />
					</Button>
				</div>
			),
		},
	]
}
