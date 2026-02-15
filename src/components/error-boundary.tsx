import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: unknown }) {
	const message = error instanceof Error ? error.message : 'An unexpected error occurred'
	return (
		<div className="flex min-h-screen items-center justify-center bg-destructive/10">
			<div className="text-center">
				<h1 className="mb-2 text-2xl font-bold text-destructive">Something went wrong</h1>
				<p className="mb-4 text-muted-foreground">{message}</p>
				<button type="button" onClick={() => globalThis.location.reload()} className="underline">
					Reload page
				</button>
			</div>
		</div>
	)
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
	return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>
}
