import { zodResolver } from '@hookform/resolvers/zod'
import {
	type CreateWebhookDestination,
	createWebhookDestinationSchema,
	WEBHOOK_EVENT_TYPES,
} from '@repo/shared'
import { useForm } from 'react-hook-form'
import { setFieldErrors } from '@/services/api-error'
import { Button } from '@/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { eventTypeLabel } from '../event-labels'
import { useCreateWebhookDestination } from '../hooks/use-webhooks'

const EVENT_CHOICES = ['*', ...WEBHOOK_EVENT_TYPES]

interface CreateWebhookDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Receives the signing secret, which the API returns only now. */
	onCreated: (secret: string) => void
}

export function CreateWebhookDialog({ open, onOpenChange, onCreated }: CreateWebhookDialogProps) {
	const createDestination = useCreateWebhookDestination()
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = useForm<CreateWebhookDestination>({
		resolver: zodResolver(createWebhookDestinationSchema),
		defaultValues: { url: '', eventTypes: ['*'] },
	})

	// A closed dialog starts clean next time; it cannot close while the destination is being created.
	const handleOpenChange = (nextOpen: boolean) => {
		if (createDestination.isPending) return
		if (!nextOpen) reset()
		onOpenChange(nextOpen)
	}

	const onSubmit = (input: CreateWebhookDestination) => {
		createDestination.mutate(input, {
			onSuccess: (created) => {
				onCreated(created.secret)
				reset()
				onOpenChange(false)
			},
			onError: (mutationError) => setFieldErrors(mutationError, setError),
		})
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>Nuevo destino</DialogTitle>
						<DialogDescription>
							Enviaremos un POST firmado a esta URL cada vez que ocurra uno de los eventos elegidos.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-5 py-6">
						<div className="space-y-2">
							<label htmlFor="webhook-url" className="text-sm font-medium text-foreground">
								URL del destino
							</label>
							<Input
								id="webhook-url"
								type="url"
								inputMode="url"
								{...register('url')}
								placeholder="https://tu-sistema.com/webhooks"
								aria-invalid={!!errors.url}
								aria-describedby={errors.url ? 'webhook-url-error' : undefined}
							/>
							{errors.url && (
								<p id="webhook-url-error" className="text-xs text-destructive">
									{errors.url.message}
								</p>
							)}
						</div>
						<fieldset
							className="space-y-2"
							aria-describedby={errors.eventTypes ? 'webhook-events-error' : undefined}
						>
							<legend className="mb-2 text-sm font-medium text-foreground">Eventos</legend>
							{EVENT_CHOICES.map((eventType) => (
								<label
									key={eventType}
									className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
								>
									<input
										type="checkbox"
										value={eventType}
										{...register('eventTypes')}
										className="accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
									<span className="text-sm text-foreground">{eventTypeLabel(eventType)}</span>
								</label>
							))}
							{errors.eventTypes && (
								<p id="webhook-events-error" className="text-xs text-destructive">
									Elige al menos un evento.
								</p>
							)}
						</fieldset>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => handleOpenChange(false)}
							className="text-muted-foreground"
						>
							Cancelar
						</Button>
						<Button type="submit" loading={createDestination.isPending}>
							Crear destino
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
