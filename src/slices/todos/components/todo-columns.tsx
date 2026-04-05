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
			className: 'w-10',
			render: (todo) => (
				<button
					type="button"
					onClick={() => onToggle(todo)}
					className="transition-colors duration-150"
					aria-label={`Marcar "${todo.title}" como ${todo.completed ? 'pendiente' : 'completada'}`}
				>
					{todo.completed ? (
						<CheckCircle2 className="h-5 w-5 text-success" />
					) : (
						<Circle className="h-5 w-5 text-muted-foreground/40 hover:text-muted-foreground" />
					)}
				</button>
			),
		},
		{
			key: 'title',
			label: 'Titulo',
			sortable: true,
			render: (todo) => (
				<span className={cn('text-sm', todo.completed && 'text-muted-foreground line-through')}>
					{todo.title}
				</span>
			),
		},
		{
			key: 'status',
			label: 'Estado',
			className: 'hidden md:table-cell w-28',
			render: (todo) => (
				<Badge variant={todo.completed ? 'success' : 'secondary'}>
					{todo.completed ? 'Completada' : 'Pendiente'}
				</Badge>
			),
		},
		{
			key: 'updatedAt',
			label: 'Actualizada',
			sortable: true,
			className: 'hidden lg:table-cell w-32',
			render: (todo) => (
				<span className="text-xs text-muted-foreground">{formatRelative(todo.updatedAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-20 text-right',
			render: (todo) => (
				<div className="flex justify-end gap-1 transition-opacity duration-150 md:opacity-0 md:group-hover/row:opacity-100 md:focus-within:opacity-100">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onEdit(todo)
						}}
						aria-label={`Editar "${todo.title}"`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onDelete(todo)
						}}
						aria-label={`Eliminar "${todo.title}"`}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			),
		},
	]
}
