import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'
import { useTheme } from '@/providers/theme-provider'

const icons = {
	success: <CircleCheck className="h-4 w-4 text-success" />,
	error: <CircleAlert className="h-4 w-4 text-destructive" />,
	warning: <TriangleAlert className="h-4 w-4 text-warning" />,
	info: <Info className="h-4 w-4 text-info" />,
	loading: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
}

export function Toaster(props: ToasterProps) {
	const { resolvedTheme } = useTheme()
	return (
		<SonnerToaster
			position="bottom-right"
			theme={resolvedTheme}
			toastOptions={{
				duration: 4000,
				classNames: {
					toast:
						'group flex w-full items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg',
					title: 'text-sm font-semibold',
					description: 'text-sm text-muted-foreground',
					actionButton: 'bg-primary text-primary-foreground',
					cancelButton: 'bg-muted text-muted-foreground',
					success: 'border-l-2 border-l-success',
					error: 'border-l-2 border-l-destructive',
					warning: 'border-l-2 border-l-warning',
					info: 'border-l-2 border-l-info',
				},
			}}
			icons={icons}
			{...props}
		/>
	)
}
