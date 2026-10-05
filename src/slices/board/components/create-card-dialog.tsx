import { type FormEvent, useState } from 'react'
import { FormDialog } from '@/ui/form-dialog'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import type { ColumnId } from '../hooks/use-board'

interface CreateCardDialogProps {
	open: boolean
	columnId: ColumnId
	columnTitle: string
	onOpenChange: (open: boolean) => void
	onCreate: (input: { title: string; description: string; columnId: ColumnId }) => void
}

export function CreateCardDialog({
	open,
	columnId,
	columnTitle,
	onOpenChange,
	onCreate,
}: CreateCardDialogProps) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmedTitle = title.trim()
		if (!trimmedTitle) return
		onCreate({ title: trimmedTitle, description: description.trim(), columnId })
		setTitle('')
		setDescription('')
		onOpenChange(false)
	}

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Nueva tarjeta"
			description={`Se agregará a "${columnTitle}".`}
			onSubmit={handleSubmit}
			submitLabel="Agregar tarjeta"
		>
			<div className="space-y-1.5">
				<label htmlFor="card-title" className="text-sm font-medium text-foreground">
					Título
				</label>
				<Input
					id="card-title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="p. ej. Revisar el pull request"
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="card-description" className="text-sm font-medium text-foreground">
					Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
				</label>
				<Textarea
					id="card-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					placeholder="Una nota corta"
					rows={3}
				/>
			</div>
		</FormDialog>
	)
}
