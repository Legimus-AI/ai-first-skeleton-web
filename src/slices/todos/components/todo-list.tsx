import type { Todo } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import type { ListParams } from '@/utils/use-query-params'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { InlineError } from '@/ui/inline-error'
import { Pagination } from '@/ui/pagination'
import { SearchInput } from '@/ui/search-input'
import {
	useBulkDeleteTodos,
	useCreateTodo,
	useDeleteTodo,
	useTodos,
	useUpdateTodo,
} from '../hooks/use-todos'
import { buildTodoColumns } from './todo-columns'
import { TodoForm } from './todo-form'

export function TodoList() {
	const params = useSearch({ from: '/_authed/todos' })
	const navigate = useNavigate()
	const setParams = useCallback(
		(updates: Partial<ListParams>) => {
			void navigate({
				to: '.',
				search: (prev: Record<string, unknown>) => ({ ...prev, ...updates }),
				replace: true,
			})
		},
		[navigate],
	)
	const [showCreate, setShowCreate] = useState(false)
	const [editTarget, setEditTarget] = useState<Todo | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showBulkDelete, setShowBulkDelete] = useState(false)
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

	const { data, isLoading, isFetching, error } = useTodos(params)
	const createTodo = useCreateTodo()
	const updateTodo = useUpdateTodo(params)
	const deleteTodo = useDeleteTodo()
	const bulkDelete = useBulkDeleteTodos()

	const columns = useMemo(
		() =>
			buildTodoColumns({
				onToggle: (todo) => updateTodo.mutate({ id: todo.id, completed: !todo.completed }),
				onEdit: setEditTarget,
				onDelete: (todo) => setDeleteId(todo.id),
			}),
		[updateTodo],
	)

	if (error) {
		return <InlineError message={error.message} onRetry={() => globalThis.location.reload()} />
	}

	const handleBulkDelete = () => {
		bulkDelete.mutate([...selectedIds], {
			onSuccess: () => {
				setSelectedIds(new Set())
				setShowBulkDelete(false)
			},
		})
	}

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Tareas"
				description="Gestiona tu lista de tareas."
				search={
					<SearchInput
						value={params.search}
						onChange={(v) => setParams({ search: v, page: 1 })}
						placeholder="Buscar tareas..."
						isLoading={isFetching && !isLoading}
						className="w-full sm:w-64"
					/>
				}
				action={
					<Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto aether-squish">
						<Plus className="mr-1.5 h-4 w-4" />
						Nueva tarea
					</Button>
				}
			/>

			<div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
				<DataTable
					data={data?.data ?? []}
					columns={columns}
					getId={(todo) => todo.id}
					isLoading={isLoading}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					sort={params.sort}
					order={params.order}
					onSortChange={(s, o) => setParams({ sort: s, order: o })}
					emptyMessage={
						params.search
							? `Sin resultados para "${params.search}"`
							: 'Sin tareas aún. ¡Crea la primera!'
					}
					emptyIcon={<CheckCircle2 className="h-6 w-6 text-muted-foreground" />}
					emptyAction={
						params.search ? (
							<Button
								size="sm"
								variant="outline"
								onClick={() => setParams({ search: '', page: 1 })}
								className="aether-squish"
							>
								Limpiar búsqueda
							</Button>
						) : (
							<Button size="sm" onClick={() => setShowCreate(true)} className="aether-squish">
								<Plus className="mr-1.5 h-4 w-4" />
								Nueva tarea
							</Button>
						)
					}
				/>
			</div>

			{data?.meta && data.meta.total > 0 && (
				<Pagination
					meta={data.meta}
					onPageChange={(p) => setParams({ page: p })}
					onPerPageChange={(l) => setParams({ limit: l, page: 1 })}
					perPageOptions={[10, 15, 25, 50]}
				/>
			)}

			<TodoForm
				open={showCreate}
				onOpenChange={setShowCreate}
				title="Nueva tarea"
				submitLabel="Crear"
				defaultValues={undefined}
				onSubmit={(input) => {
					createTodo.mutate(
						{ ...input, priority: input.priority ?? 'medium' },
						{ onSuccess: () => setShowCreate(false) },
					)
				}}
				isPending={createTodo.isPending}
			/>

			<TodoForm
				open={editTarget !== null}
				onOpenChange={() => setEditTarget(null)}
				title="Editar tarea"
				submitLabel="Guardar"
				defaultValues={
					editTarget
						? {
								title: editTarget.title,
								description: editTarget.description,
								priority: editTarget.priority,
							}
						: undefined
				}
				onSubmit={(input) => {
					if (!editTarget) return
					updateTodo.mutate(
						{ id: editTarget.id, ...input, priority: input.priority ?? 'medium' },
						{ onSuccess: () => setEditTarget(null) },
					)
				}}
				isPending={updateTodo.isPending}
			/>

			<ConfirmDelete
				open={deleteId !== null}
				onOpenChange={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) {
						deleteTodo.mutate(deleteId)
						setDeleteId(null)
					}
				}}
				title="¿Eliminar tarea?"
				isPending={deleteTodo.isPending}
			/>

			<ConfirmDelete
				open={showBulkDelete}
				onOpenChange={setShowBulkDelete}
				onConfirm={handleBulkDelete}
				title={`¿Eliminar ${selectedIds.size} tarea${selectedIds.size === 1 ? '' : 's'}?`}
				description={`Se eliminarán permanentemente ${selectedIds.size} elemento${selectedIds.size === 1 ? '' : 's'}. Esta acción no se puede deshacer.`}
				isPending={bulkDelete.isPending}
			/>

			{/* Floating Bulk Actions Bar */}
			{selectedIds.size > 0 && (
				<div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300">
					<div className="flex items-center gap-2 sm:gap-3 rounded-full border border-border/50 bg-background/95 px-3 sm:px-4 py-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10">
						<span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs font-medium text-primary-foreground">
							{selectedIds.size}
						</span>
						<span className="hidden sm:block border-r border-border/50 pr-2 text-sm font-medium text-foreground">
							Seleccionadas
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowBulkDelete(true)}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm"
						>
							<Trash2 className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
							Eliminar
						</Button>
					</div>
				</div>
			)}
		</FadeIn>
	)
}
