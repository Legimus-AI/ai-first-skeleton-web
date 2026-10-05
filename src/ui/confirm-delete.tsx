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
import { Spinner } from '@/ui/icons'

interface ConfirmDeleteProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
	title?: string
	description?: string
	isPending?: boolean
	confirmLabel?: string
}

export function ConfirmDelete({
	open,
	onOpenChange,
	onConfirm,
	title = '¿Estás seguro?',
	description = 'Esta acción no se puede deshacer. El elemento se eliminará para siempre.',
	isPending,
	confirmLabel = 'Eliminar',
}: ConfirmDeleteProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={(event) => {
							// Stay open until the request settles; the caller closes it in onSettled.
							event.preventDefault()
							onConfirm()
						}}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending && <Spinner className="mr-1.5 h-4 w-4 animate-spin" />}
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
