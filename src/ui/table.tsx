import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Table({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
	return (
		<div className="w-full overflow-x-auto">
			<table className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	)
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={cn(
				'group/row border-b border-border transition-colors duration-150 ease-standard hover:bg-accent/60 data-[selected=true]:bg-accent',
				className,
			)}
			{...props}
		/>
	)
}

export function TableHead({ className, ...props }: ComponentPropsWithoutRef<'th'>) {
	return (
		<th
			className={cn(
				'px-4 py-(--row-padding-y) text-left text-xs font-medium text-muted-foreground [&:has([role=checkbox])]:w-12',
				className,
			)}
			{...props}
		/>
	)
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
	return (
		<td
			className={cn('px-4 py-(--row-padding-y) [&:has([role=checkbox])]:w-12', className)}
			{...props}
		/>
	)
}
