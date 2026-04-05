import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog'

interface FormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	onSubmit: (e: FormEvent<HTMLFormElement>) => void
	isPending?: boolean
	submitLabel?: string
	children: ReactNode
}

export function FormDialog({
	open,
	onOpenChange,
	title,
	description,
	onSubmit,
	isPending,
	submitLabel = 'Save',
	children,
}: FormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					{children}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
