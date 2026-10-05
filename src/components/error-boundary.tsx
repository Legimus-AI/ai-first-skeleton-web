import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { InlineError } from '@/ui/inline-error'

interface ErrorBoundaryProps {
	children: ReactNode
	/** Values that clear the error when they change, e.g. the current location. */
	resetKeys?: unknown[]
}

export function ErrorBoundary({ children, resetKeys }: ErrorBoundaryProps) {
	return (
		<ReactErrorBoundary
			{...(resetKeys && { resetKeys })}
			fallbackRender={({ error, resetErrorBoundary }) => (
				<div className="flex min-h-dvh items-center justify-center bg-background p-4">
					<InlineError error={error} onRetry={resetErrorBoundary} />
				</div>
			)}
		>
			{children}
		</ReactErrorBoundary>
	)
}
