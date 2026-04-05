import { AlertCircle } from 'lucide-react'
import { Button } from '@/ui/button'

interface InlineErrorProps {
	message: string
	onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertCircle className="h-6 w-6 text-destructive" />
			</div>
			<p className="mt-4 text-sm font-medium">Something went wrong</p>
			<p className="mt-1 text-sm text-muted-foreground">{message}</p>
			{onRetry && (
				<Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
					Try again
				</Button>
			)}
		</div>
	)
}
