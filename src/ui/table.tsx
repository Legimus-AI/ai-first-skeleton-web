import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Table({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
	return (
		<div className="w-full overflow-x-auto">
			<table className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	)
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead
			className={cn(
				'[&_tr]:border-b [&_tr]:border-border',
				'dark:[&_tr]:border-[rgba(255,255,255,0.08)]',
				className,
			)}
			{...props}
		/>
	)
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={cn(
				'group/row border-b border-border/50 transition-colors duration-150 hover:bg-muted/50 data-[selected=true]:bg-primary/5',
				'dark:border-[rgba(255,255,255,0.06)] dark:hover:bg-[rgba(255,255,255,0.03)]',
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
				'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:w-12',
				className,
			)}
			{...props}
		/>
	)
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
	return <td className={cn('px-4 py-3 [&:has([role=checkbox])]:w-12', className)} {...props} />
}
