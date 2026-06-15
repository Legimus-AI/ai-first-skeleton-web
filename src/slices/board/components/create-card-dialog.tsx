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
			title="New card"
			description={`This card will be added to "${columnTitle}".`}
			onSubmit={handleSubmit}
			submitLabel="Add card"
		>
			<div className="space-y-1.5">
				<label htmlFor="card-title" className="text-sm font-medium text-foreground">
					Title
				</label>
				<Input
					id="card-title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="e.g. Review the pull request"
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="card-description" className="text-sm font-medium text-foreground">
					Description
				</label>
				<Textarea
					id="card-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					placeholder="Add a short note (optional)"
					rows={3}
				/>
			</div>
		</FormDialog>
	)
}
