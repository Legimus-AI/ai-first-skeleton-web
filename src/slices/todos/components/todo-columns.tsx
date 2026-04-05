import type { Todo } from '@repo/shared'
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'

function formatDate(date: string): string {
	const d = new Date(date)
	const day = d.getDate().toString().padStart(2, '0')
	const month = (d.getMonth() + 1).toString().padStart(2, '0')
	const year = d.getFullYear()
	const hours = d.getHours().toString().padStart(2, '0')
	const minutes = d.getMinutes().toString().padStart(2, '0')
	return `${day}/${month}/${year} ${hours}:${minutes}`
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
					onClick={(e) => {
						e.stopPropagation()
						onToggle(item)
					}}
					className="transition-colors duration-150"
					aria-label={`Marcar "${item.title}" como ${item.completed ? 'pendiente' : 'completada'}`}
				>
					{item.completed ? (
						<CheckCircle2 className="h-4.5 w-4.5 text-primary" />
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
				<div className="flex flex-col gap-0.5 py-1">
					<span
						className={cn(
							'text-sm font-medium',
							item.completed && 'text-muted-foreground line-through',
						)}
					>
						{item.title}
					</span>
					{item.description && (
						<span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
					)}
				</div>
			),
		},
		{
			key: 'priority',
			label: 'Prioridad',
			sortable: true,
			className: 'hidden sm:table-cell w-24',
			render: (item) => {
				if (item.priority === 'high') {
					return (
						<div className="flex items-center text-xs text-destructive font-medium">
							<ArrowUp className="mr-1 h-3.5 w-3.5" /> Alta
						</div>
					)
				}
				if (item.priority === 'medium') {
					return (
						<div className="flex items-center text-xs text-warning-foreground font-medium">
							<ArrowRight className="mr-1 h-3.5 w-3.5" /> Media
						</div>
					)
				}
				return (
					<div className="flex items-center text-xs text-muted-foreground font-medium">
						<ArrowDown className="mr-1 h-3.5 w-3.5" /> Baja
					</div>
				)
			},
		},
		{
			key: 'updatedAt',
			label: 'Modificada',
			sortable: true,
			className: 'hidden lg:table-cell w-36',
			render: (item) => (
				<span className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-20 text-right',
			render: (item) => (
				<div className="flex justify-end gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onEdit(item)
						}}
						aria-label={`Editar "${item.title}"`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onDelete(item)
						}}
						aria-label={`Eliminar "${item.title}"`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	]
}
