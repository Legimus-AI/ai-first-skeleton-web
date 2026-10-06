import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { InlineError } from '@/ui/inline-error'

/** Route error screen: rendered in place of the failed route, so the layout around it stays. */
export function RouteError({ error }: ErrorComponentProps) {
	const router = useRouter()
	// invalidate() re-runs beforeLoad/loaders and clears the errored match; no page reload.
	return <InlineError error={error} onRetry={() => void router.invalidate()} />
}
