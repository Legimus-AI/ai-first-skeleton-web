import { AlertCircle, Copy, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { ApiError } from '@/services/api-error'
import { Button } from '@/ui/button'

function buildDebugPayload(error: unknown): string {
	const base = {
		message: error instanceof Error ? error.message : String(error),
		requestId: error instanceof ApiError ? error.requestId : undefined,
		code: error instanceof ApiError ? error.code : undefined,
		url: globalThis.location.href,
		timestamp: new Date().toISOString(),
		userAgent: navigator.userAgent,
	}
	return JSON.stringify(base, null, 2)
}

function ErrorFallback({ error }: { error: unknown }) {
	const message = error instanceof Error ? error.message : 'An unexpected error occurred'
	const requestId = error instanceof ApiError ? error.requestId : undefined

	const copyDebugInfo = () => {
		navigator.clipboard.writeText(buildDebugPayload(error))
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="flex max-w-md flex-col items-center text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
					<AlertCircle className="h-7 w-7 text-destructive" />
				</div>
				<h1 className="mt-5 text-xl font-semibold text-foreground">Something went wrong</h1>
				<p className="mt-2 text-sm text-muted-foreground">{message}</p>
				{requestId && (
					<code className="mt-3 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
						{requestId}
					</code>
				)}
				<div className="mt-6 flex items-center gap-3">
					<Button variant="outline" size="sm" onClick={copyDebugInfo}>
						<Copy className="mr-1.5 h-3.5 w-3.5" />
						Copy debug info
					</Button>
					<Button size="sm" onClick={() => globalThis.location.reload()}>
						<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
						Reload page
					</Button>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
	return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>
}
