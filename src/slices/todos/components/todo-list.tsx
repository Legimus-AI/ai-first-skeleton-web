import type { Todo } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/cn'
import type { ListParams } from '@/lib/use-query-params'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { type Column, DataTable } from '@/ui/data-table'
import { Pagination } from '@/ui/pagination'
import { SearchInput } from '@/ui/search-input'
import {
	useBulkDeleteTodos,
	useCreateTodo,
	useDeleteTodo,
	useTodos,
	useUpdateTodo,
} from '../hooks/use-todos'
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
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

	const { data, isLoading, error } = useTodos(params)
	const createTodo = useCreateTodo()
	const updateTodo = useUpdateTodo()
	const deleteTodo = useDeleteTodo()
	const bulkDelete = useBulkDeleteTodos()

	if (error) {
		return <p className="py-8 text-center text-destructive">Error: {error.message}</p>
	}

	const handleBulkDelete = () => {
		bulkDelete.mutate([...selectedIds], { onSuccess: () => setSelectedIds(new Set()) })
	}

	const columns: Column<Todo>[] = [
		{
			key: 'completed',
			label: '',
			className: 'w-10',
			render: (todo) => (
				<input
					type="checkbox"
					checked={todo.completed}
					onChange={() => updateTodo.mutate({ id: todo.id, completed: !todo.completed })}
					className="h-4 w-4 rounded border-input"
					aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
				/>
			),
		},
		{
			key: 'title',
			label: 'Title',
			sortable: true,
			render: (todo) => (
				<span className={cn('text-sm', todo.completed && 'text-muted-foreground line-through')}>
					{todo.title}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-24 text-right',
			render: (todo) => (
				<div className="flex justify-end gap-1">
					<Button
						variant="ghost"
						size="sm"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setEditTarget(todo)
						}}
					>
						Edit
					</Button>
					<Button
						variant="ghost"
						size="sm"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setDeleteId(todo.id)
						}}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			),
		},
	]

	return (
		<div className="space-y-2">
			<CrudPageHeader
				title="Todos"
				search={
					<SearchInput
						value={params.search}
						onChange={(v) => setParams({ search: v, page: 1 })}
						placeholder="Search todos..."
					/>
				}
				action={<Button onClick={() => setShowCreate(true)}>Add Todo</Button>}
				bulkAction={
					selectedIds.size > 0 ? (
						<>
							<span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
							<Button variant="destructive" size="sm" onClick={handleBulkDelete}>
								<Trash2 className="mr-1 h-3.5 w-3.5" />
								Delete selected
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
				emptyMessage="No todos yet. Create your first one!"
				emptyIcon={<CheckCircle2 className="h-10 w-10 text-muted-foreground" />}
				emptyAction={<Button onClick={() => setShowCreate(true)}>Add Todo</Button>}
			/>

			<Pagination meta={data?.meta} onPageChange={(p) => setParams({ page: p })} />

			<TodoForm
				open={showCreate}
				onOpenChange={setShowCreate}
				title="New Todo"
				submitLabel="Create"
				defaultValues={undefined}
				onSubmit={(input) => {
					createTodo.mutate(input, { onSuccess: () => setShowCreate(false) })
				}}
				isPending={createTodo.isPending}
			/>

			<TodoForm
				open={editTarget !== null}
				onOpenChange={() => setEditTarget(null)}
				title="Edit Todo"
				submitLabel="Save"
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
				title="Delete todo?"
				isPending={deleteTodo.isPending}
			/>
		</div>
	)
}
