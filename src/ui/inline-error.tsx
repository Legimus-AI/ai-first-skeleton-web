import { AlertCircle, Copy, RefreshCw, WifiOff } from 'lucide-react'
import { ApiError, isServerUnreachable, toUserMessage } from '@/services/api-error'
import { copyToClipboard } from '@/services/clipboard-service'
import { Button } from '@/ui/button'

interface InlineErrorProps {
	error: unknown
	/** Re-run what failed without reloading the page (`refetch`, `router.invalidate`). */
	onRetry?: () => void
}

/** What support needs to trace the failure; never cookies or tokens. */
function describeError(error: unknown): string {
	return JSON.stringify(
		{
			message: error instanceof Error ? error.message : String(error),
			code: error instanceof ApiError ? error.code : undefined,
			status: error instanceof ApiError ? error.status : undefined,
			requestId: error instanceof ApiError ? error.requestId : undefined,
			url: globalThis.location.href,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
		},
		null,
		2,
	)
}

export function InlineError({ error, onRetry }: InlineErrorProps) {
	const Icon = isServerUnreachable(error) ? WifiOff : AlertCircle
	return (
		<div role="alert" className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
				<Icon className="h-6 w-6 text-destructive" />
			</div>
			<p className="mt-4 max-w-md text-sm font-medium">{toUserMessage(error)}</p>
			<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => void copyToClipboard(describeError(error), 'Detalles copiados')}
				>
					<Copy className="mr-1.5 h-3.5 w-3.5" />
					Copiar detalles
				</Button>
				{onRetry && (
					<Button variant="outline" size="sm" onClick={onRetry}>
						<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
						Reintentar
					</Button>
				)}
			</div>
		</div>
	)
}
