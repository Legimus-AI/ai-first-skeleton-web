import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'
import { useTheme } from '@/lib/theme-provider'

const icons = {
	success: <CircleCheck className="h-4 w-4 text-success" />,
	error: <CircleAlert className="h-4 w-4 text-destructive" />,
	warning: <TriangleAlert className="h-4 w-4 text-warning" />,
	info: <Info className="h-4 w-4 text-info" />,
	loading: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
}

const toastStyle = {
	'--normal-bg': 'var(--popover)',
	'--normal-text': 'var(--popover-foreground)',
	'--normal-border': 'var(--border)',
	'--border-radius': 'var(--radius)',
	'--success-bg': 'var(--popover)',
	'--success-text': 'var(--popover-foreground)',
	'--success-border': 'var(--border)',
	'--error-bg': 'var(--popover)',
	'--error-text': 'var(--popover-foreground)',
	'--error-border': 'var(--border)',
} as React.CSSProperties

export function Toaster(props: ToasterProps) {
	const { resolvedTheme } = useTheme()
	return (
		<SonnerToaster
			position="bottom-right"
			theme={resolvedTheme}
			style={toastStyle}
			icons={icons}
			toastOptions={{ duration: 4000 }}
			{...props}
		/>
	)
}
