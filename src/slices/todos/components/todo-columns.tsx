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
						<Circle className="h-4.5 w-4.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors" />
					)}
				</button>
			),
		},
		{
			key: 'title',
			label: 'Título',
			sortable: true,
			render: (item) => (
				<div className="flex flex-col gap-0.5 py-1">
					<span
						className={cn(
							'text-sm font-medium tracking-tight',
							item.completed && 'text-muted-foreground/60 line-through',
						)}
					>
						{item.title}
					</span>
					{item.description && (
						<span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>
					)}
				</div>
			),
		},
		{
			key: 'priority',
			label: 'Prioridad',
			sortable: true,
			className: 'hidden w-28 sm:table-cell',
			render: (item) => {
				if (item.priority === 'high') {
					return (
						<div className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
							<ArrowUp className="mr-1 h-3 w-3" /> Alta
						</div>
					)
				}
				if (item.priority === 'medium') {
					return (
						<div className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
							<ArrowRight className="mr-1 h-3 w-3" /> Media
						</div>
					)
				}
				return (
					<div className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground/70">
						<ArrowDown className="mr-1 h-3 w-3" /> Baja
					</div>
				)
			},
		},
		{
			key: 'updatedAt',
			label: 'Modificada',
			sortable: true,
			className: 'hidden w-36 lg:table-cell',
			render: (item) => (
				<span className="font-mono text-[11px] tabular-nums text-muted-foreground">
					{formatDate(item.updatedAt)}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-20 text-right',
			render: (item) => (
				<div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100 sm:group-hover:opacity-100">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
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
						className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
