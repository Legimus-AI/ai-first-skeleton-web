import { copyToClipboard } from '@/services/clipboard-service'
import { Button } from '@/ui/button'

interface WebhookSecretNoticeProps {
	secret: string
	onClose: () => void
}

/** The signing secret of a destination just created: shown once, never again. */
export function WebhookSecretNotice({ secret, onClose }: WebhookSecretNoticeProps) {
	return (
		<div
			role="status"
			className="animate-in fade-in slide-in-from-top-2 space-y-3 rounded-surface border border-primary/20 bg-primary/5 p-(--surface-padding)"
		>
			<div className="space-y-1">
				<p className="text-sm font-medium text-foreground">Secreto de firma del destino</p>
				<p className="text-xs text-muted-foreground">
					Cópialo ahora: no se volverá a mostrar. Cada envío trae las cabeceras webhook-id,
					webhook-timestamp y webhook-signature (Standard Webhooks); verifícalas con este secreto.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<code className="flex-1 break-all rounded-control border border-border bg-background p-3 font-mono text-sm text-foreground">
					{secret}
				</code>
				<Button type="button" variant="secondary" onClick={() => void copyToClipboard(secret)}>
					Copiar
				</Button>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onClose}
				className="text-muted-foreground hover:text-foreground"
			>
				Cerrar
			</Button>
		</div>
	)
}
