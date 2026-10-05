import type { Todo } from '@repo/shared'
import { Button } from '@/ui/button'
import type { Column } from '@/ui/data-table'
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle, Circle, Pencil, Trash } from '@/ui/icons'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format-date'

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
					className="rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={`Marcar "${item.title}" como ${item.completed ? 'pendiente' : 'completada'}`}
				>
					{item.completed ? (
						<CheckCircle className="h-4.5 w-4.5 text-primary" />
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
				<div className="flex min-w-0 flex-col gap-0.5 py-1">
					<span
						className={cn(
							'text-sm font-medium tracking-tight wrap-anywhere',
							item.completed && 'text-muted-foreground/60 line-through',
						)}
					>
						{item.title}
					</span>
					{item.description && (
						<span className="line-clamp-1 text-xs text-muted-foreground wrap-anywhere">
							{item.description}
						</span>
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
					{formatDateTime(item.updatedAt)}
				</span>
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
						<Trash className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	]
}
