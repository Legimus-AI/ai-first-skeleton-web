import { zodResolver } from '@hookform/resolvers/zod'
import { createTodoSchema } from '@repo/shared'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

type CreateTodoInput = z.input<typeof createTodoSchema>

interface TodoFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: CreateTodoInput) => void
	isPending: boolean
	defaultValues: Partial<CreateTodoInput> | undefined
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
	const form = useForm<CreateTodoInput>({
		resolver: zodResolver(createTodoSchema),
		defaultValues: { title: '', description: '', priority: 'medium', ...defaultValues },
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on open — defaultValues changes during close animation cause flash
	useEffect(() => {
		if (open) {
			form.reset({ title: '', description: '', priority: 'medium', ...defaultValues })
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
			<div className="space-y-5">
				<div className="space-y-1.5">
					<label htmlFor="todo-title" className="text-sm font-medium text-foreground">
						Titulo
					</label>
					<Input
						id="todo-title"
						{...form.register('title')}
						placeholder="Que hay que hacer?"
						className="aether-input-inset"
						autoFocus
					/>
					{form.formState.errors.title && (
						<p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label htmlFor="todo-description" className="text-sm font-medium text-foreground">
						Descripcion <span className="text-muted-foreground font-normal">(Opcional)</span>
					</label>
					<Textarea
						id="todo-description"
						{...form.register('description')}
						placeholder="Detalles adicionales..."
						className="aether-input-inset min-h-[100px]"
					/>
					{form.formState.errors.description && (
						<p className="mt-1 text-xs text-destructive">
							{form.formState.errors.description.message}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label htmlFor="todo-priority" className="text-sm font-medium text-foreground">
						Prioridad
					</label>
					<Select id="todo-priority" {...form.register('priority')} className="aether-input-inset">
						<option value="low">Baja</option>
						<option value="medium">Media</option>
						<option value="high">Alta</option>
					</Select>
					{form.formState.errors.priority && (
						<p className="mt-1 text-xs text-destructive">
							{form.formState.errors.priority.message}
						</p>
					)}
				</div>
			</div>
		</FormDialog>
	)
}
