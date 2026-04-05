import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateTodo, createTodoSchema } from '@repo/shared'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'

interface TodoFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: CreateTodo) => void
	isPending: boolean
	defaultValues: Partial<CreateTodo> | undefined
	title: string
	submitLabel: string
}

export function TodoForm({
	open,
	onOpenChange,
	onSubmit,
	isPending,
	defaultValues,
	title,
	submitLabel,
}: TodoFormProps) {
	const form = useForm<CreateTodo>({
		resolver: zodResolver(createTodoSchema),
		defaultValues: { title: '', ...defaultValues },
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on open — defaultValues changes during close animation cause flash
	useEffect(() => {
		if (open) {
			form.reset({ title: '', ...defaultValues })
		}
	}, [open])

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			onSubmit={form.handleSubmit(onSubmit)}
			isPending={isPending}
			submitLabel={submitLabel}
		>
			<div className="space-y-2">
				<label htmlFor="todo-title" className="text-sm font-medium">
					Title
				</label>
				<Input id="todo-title" {...form.register('title')} placeholder="What needs to be done?" />
				{form.formState.errors.title && (
					<p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
				)}
			</div>
		</FormDialog>
	)
}
