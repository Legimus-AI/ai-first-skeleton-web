import type { Todo } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import type { ListParams } from '@/lib/use-query-params'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
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
	const updateTodo = useUpdateTodo()
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
		<div className="space-y-6">
			<CrudPageHeader
				title="Tareas"
				description="Gestiona tu lista de tareas."
				search={
					<SearchInput
						value={params.search}
						onChange={(v) => setParams({ search: v, page: 1 })}
						placeholder="Buscar tareas..."
						isLoading={isFetching && !isLoading}
					/>
				}
				action={
					<Button onClick={() => setShowCreate(true)}>
						<Plus className="mr-1.5 h-4 w-4" />
						Nueva tarea
					</Button>
				}
				bulkAction={
					selectedIds.size > 0 ? (
						<>
							<span className="text-sm text-muted-foreground">
								{selectedIds.size} seleccionada{selectedIds.size > 1 ? 's' : ''}
							</span>
							<Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
								<Trash2 className="mr-1 h-3.5 w-3.5" />
								Eliminar
							</Button>
						</>
					) : undefined
				}
			/>

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
						: 'Sin tareas aun. Crea la primera!'
				}
				emptyIcon={<CheckCircle2 className="h-6 w-6 text-muted-foreground" />}
				emptyAction={
					params.search ? (
						<Button size="sm" variant="outline" onClick={() => setParams({ search: '', page: 1 })}>
							Limpiar busqueda
						</Button>
					) : (
						<Button size="sm" onClick={() => setShowCreate(true)}>
							<Plus className="mr-1.5 h-4 w-4" />
							Nueva tarea
						</Button>
					)
				}
			/>

			<Pagination
				meta={data?.meta}
				onPageChange={(p) => setParams({ page: p })}
				onPerPageChange={(l) => setParams({ limit: l, page: 1 })}
				perPageOptions={[10, 15, 25, 50]}
			/>

			<TodoForm
				open={showCreate}
				onOpenChange={setShowCreate}
				title="Nueva tarea"
				submitLabel="Crear"
				defaultValues={undefined}
				onSubmit={(input) => {
					createTodo.mutate(input, { onSuccess: () => setShowCreate(false) })
				}}
				isPending={createTodo.isPending}
			/>

			<TodoForm
				open={editTarget !== null}
				onOpenChange={() => setEditTarget(null)}
				title="Editar tarea"
				submitLabel="Guardar"
				defaultValues={editTarget ? { title: editTarget.title } : undefined}
				onSubmit={(input) => {
					if (!editTarget) return
					updateTodo.mutate(
						{ id: editTarget.id, ...input },
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
				title="Eliminar tarea?"
				isPending={deleteTodo.isPending}
			/>

			<ConfirmDelete
				open={showBulkDelete}
				onOpenChange={setShowBulkDelete}
				onConfirm={handleBulkDelete}
				title={`Eliminar ${selectedIds.size} tarea${selectedIds.size === 1 ? '' : 's'}?`}
				description={`Se eliminaran permanentemente ${selectedIds.size} elemento${selectedIds.size === 1 ? '' : 's'}. Esta accion no se puede deshacer.`}
				isPending={bulkDelete.isPending}
			/>
		</div>
	)
}
