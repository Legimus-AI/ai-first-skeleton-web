import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateTodo, createTodoSchema } from '@repo/shared'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { type Column, DataTable } from '@/ui/data-table'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'
import { Pagination } from '@/ui/pagination'
import { SearchInput } from '@/ui/search-input'
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '../hooks/use-todos'

export function TodoList() {
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [sort, setSort] = useState('createdAt')
	const [order, setOrder] = useState<'asc' | 'desc'>('desc')
	const [showCreate, setShowCreate] = useState(false)
	const [deleteId, setDeleteId] = useState<string | null>(null)

	const { data, isLoading } = useTodos({ search, page, sort, order })
	const createTodo = useCreateTodo()
	const updateTodo = useUpdateTodo()
	const deleteTodo = useDeleteTodo()

	const form = useForm<CreateTodo>({ resolver: zodResolver(createTodoSchema) })
	const onCreateSubmit = form.handleSubmit((input) => {
		createTodo.mutate(input, {
			onSuccess: () => {
				setShowCreate(false)
				form.reset()
			},
		})
	})

	const columns: Column<{ id: string; title: string; completed: boolean }>[] = [
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
			className: 'w-20 text-right',
			render: (todo) => (
				<Button
					variant="destructive"
					size="sm"
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						setDeleteId(todo.id)
					}}
				>
					Delete
				</Button>
			),
		},
	]

	return (
		<div className="mx-auto max-w-2xl space-y-2">
			<CrudPageHeader
				title="Todos"
				search={
					<SearchInput
						value={search}
						onChange={(v) => {
							setSearch(v)
							setPage(1)
						}}
						placeholder="Search todos..."
					/>
				}
				action={<Button onClick={() => setShowCreate(true)}>Add Todo</Button>}
			/>

			<DataTable
				data={data?.data ?? []}
				columns={columns}
				getId={(todo) => todo.id}
				isLoading={isLoading}
				sort={sort}
				order={order}
				onSortChange={(s, o) => {
					setSort(s)
					setOrder(o)
				}}
				emptyMessage="No todos yet. Create your first one!"
				emptyIcon={<CheckCircle2 className="h-10 w-10 text-muted-foreground" />}
				emptyAction={<Button onClick={() => setShowCreate(true)}>Add Todo</Button>}
			/>

			<Pagination meta={data?.meta} onPageChange={setPage} />

			<FormDialog
				open={showCreate}
				onOpenChange={setShowCreate}
				title="New Todo"
				onSubmit={onCreateSubmit}
				isPending={createTodo.isPending}
				submitLabel="Create"
			>
				<div>
					<label htmlFor="todo-title" className="text-sm font-medium">
						Title
					</label>
					<Input id="todo-title" {...form.register('title')} placeholder="What needs to be done?" />
					{form.formState.errors.title && (
						<p className="mt-1 text-sm text-destructive">{form.formState.errors.title.message}</p>
					)}
				</div>
			</FormDialog>

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
				description="This action cannot be undone. The todo will be permanently deleted."
				isPending={deleteTodo.isPending}
			/>
		</div>
	)
}
