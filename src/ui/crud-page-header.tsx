import type { ReactNode } from 'react'

interface CrudPageHeaderProps {
	title: string
	description?: string
	action?: ReactNode
	bulkAction?: ReactNode
	search?: ReactNode
}

export function CrudPageHeader({
	title,
	description,
	action,
	bulkAction,
	search,
}: CrudPageHeaderProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
					{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
				</div>
				<div className="flex items-center gap-3">
					{search}
					{action}
				</div>
			</div>
			{bulkAction && (
				<div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-2">
					{bulkAction}
				</div>
			)}
			<div className="border-b border-border/50" />
		</div>
	)
}
