import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { ApiError } from '@/lib/api-error'
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
		<div className="flex min-h-screen items-center justify-center bg-destructive/10 p-4">
			<div className="text-center">
				<h1 className="mb-2 text-2xl font-bold text-destructive">Something went wrong</h1>
				<p className="mb-4 text-muted-foreground">{message}</p>
				{requestId && (
					<code className="mb-4 block rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
						{requestId}
					</code>
				)}
				<div className="mb-4 flex items-center justify-center gap-2">
					<Button variant="outline" size="sm" onClick={copyDebugInfo}>
						Copy debug info
					</Button>
				</div>
				<button
					type="button"
					onClick={() => globalThis.location.reload()}
					className="underline transition-colors duration-150"
				>
					Reload page
				</button>
			</div>
		</div>
	)
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
	return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>
}
