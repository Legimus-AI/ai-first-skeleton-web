import { cn } from '@/lib/cn'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateTodo, createTodoSchema } from '@repo/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '../hooks/use-todos'

export function TodoList() {
	const { data, isLoading, error } = useTodos()
	const createTodo = useCreateTodo()
	const updateTodo = useUpdateTodo()
	const deleteTodo = useDeleteTodo()
	const [deleteId, setDeleteId] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = useForm<CreateTodo>({
		resolver: zodResolver(createTodoSchema),
	})

	const onSubmit = (input: CreateTodo) => {
		createTodo.mutate(input, {
			onSuccess: () => reset(),
			onError: (err) => {
				const fields = (err as Error & { fields?: Record<string, string> }).fields
				if (fields) {
					for (const [field, message] of Object.entries(fields)) {
						setError(field as keyof CreateTodo, { message })
					}
				}
			},
		})
	}

	const confirmDelete = () => {
		if (deleteId) {
			deleteTodo.mutate(deleteId)
			setDeleteId(null)
		}
	}

	if (isLoading) return <p className="text-muted-foreground">Loading todos...</p>
	if (error) return <p className="text-destructive">Error: {error.message}</p>

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
				<Input {...register('title')} placeholder="What needs to be done?" error={!!errors.title} />
				<Button type="submit" disabled={createTodo.isPending}>
					{createTodo.isPending ? 'Adding...' : 'Add'}
				</Button>
			</form>

			{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}

			<ul className="divide-y divide-border rounded-md border border-border">
				{data?.data.map((todo) => (
					<li key={todo.id} className="flex items-center gap-3 px-4 py-3">
						<input
							type="checkbox"
							checked={todo.completed}
							onChange={() => updateTodo.mutate({ id: todo.id, completed: !todo.completed })}
							className="h-4 w-4 rounded border-input"
						/>
						<span
							className={cn(
								'flex-1 text-sm',
								todo.completed && 'text-muted-foreground line-through',
							)}
						>
							{todo.title}
						</span>
						<Button
							variant="destructive"
							size="sm"
							type="button"
							onClick={() => setDeleteId(todo.id)}
						>
							Delete
						</Button>
					</li>
				))}
				{data?.data.length === 0 && (
					<li className="px-4 py-8 text-center text-sm text-muted-foreground">
						No todos yet. Add one above!
					</li>
				)}
			</ul>

			<p className="text-center text-xs text-muted-foreground">{data?.meta.total ?? 0} todos</p>

			<AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete todo?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. The todo will be permanently deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
