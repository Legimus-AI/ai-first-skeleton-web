import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/ui/skeleton'

function SortIcon({
	sort,
	order,
	columnKey,
}: {
	sort?: string
	order?: 'asc' | 'desc'
	columnKey: string
}) {
	if (sort !== columnKey) return <ArrowUpDown className="h-3 w-3 opacity-40" />
	if (order === 'asc') return <ArrowUp className="h-3 w-3" />
	return <ArrowDown className="h-3 w-3" />
}

export interface Column<T> {
	key: string
	label: string
	render: (item: T) => ReactNode
	sortable?: boolean
	className?: string
}

interface DataTableProps<T> {
	data: T[]
	columns: Column<T>[]
	getId: (item: T) => string
	isLoading?: boolean
	onRowClick?: (item: T) => void
	selectedIds?: Set<string>
	onSelectionChange?: (ids: Set<string>) => void
	sort?: string
	order?: 'asc' | 'desc'
	onSortChange?: (sort: string, order: 'asc' | 'desc') => void
	emptyMessage?: string
	emptyAction?: ReactNode
	emptyIcon?: ReactNode
	skeletonRows?: number
}

export function DataTable<T>({
	data,
	columns,
	getId,
	isLoading,
	onRowClick,
	selectedIds,
	onSelectionChange,
	sort,
	order,
	onSortChange,
	emptyMessage = 'No items found.',
	emptyAction,
	emptyIcon,
	skeletonRows = 5,
}: DataTableProps<T>) {
	const hasSelection = onSelectionChange !== undefined
	const allSelected = data.length > 0 && selectedIds?.size === data.length

	const toggleAll = () => {
		if (!onSelectionChange) return
		onSelectionChange(allSelected ? new Set() : new Set(data.map(getId)))
	}

	const toggleOne = (id: string) => {
		if (!onSelectionChange || !selectedIds) return
		const next = new Set(selectedIds)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		onSelectionChange(next)
	}

	const handleSort = (key: string) => {
		if (!onSortChange) return
		const nextOrder = sort === key && order === 'asc' ? 'desc' : 'asc'
		onSortChange(key, nextOrder)
	}

	if (isLoading) {
		return (
			<div className="mt-6 overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border text-left text-xs text-muted-foreground">
							{hasSelection && <th className="w-10 pb-2 pr-2" />}
							{columns.map((col) => (
								<th key={col.key} className={cn('pb-2 pr-4 font-medium', col.className)}>
									{col.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: skeletonRows }).map((_, i) => (
							<tr key={`skel-${i.toString()}`} className="border-b border-border">
								{hasSelection && (
									<td className="py-3 pr-2">
										<Skeleton className="h-4 w-4 rounded" />
									</td>
								)}
								{columns.map((col) => (
									<td key={col.key} className={cn('py-3 pr-4', col.className)}>
										<Skeleton className="h-4 w-full max-w-[200px]" />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}

	if (data.length === 0) {
		return (
			<div className="mt-16 flex flex-col items-center text-center">
				{emptyIcon && <div className="mb-4">{emptyIcon}</div>}
				<p className="text-sm text-muted-foreground">{emptyMessage}</p>
				{emptyAction && <div className="mt-4">{emptyAction}</div>}
			</div>
		)
	}

	return (
		<div className="mt-6 overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-border text-left text-xs text-muted-foreground">
						{hasSelection && (
							<th className="w-10 pb-2 pr-2">
								<input
									type="checkbox"
									checked={allSelected}
									onChange={toggleAll}
									className="rounded border-input"
									aria-label="Select all rows"
								/>
							</th>
						)}
						{columns.map((col) => (
							<th key={col.key} className={cn('pb-2 pr-4 font-medium', col.className)}>
								{col.sortable && onSortChange ? (
									<button
										type="button"
										onClick={() => handleSort(col.key)}
										className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-foreground"
									>
										{col.label}
										<SortIcon sort={sort} order={order} columnKey={col.key} />
									</button>
								) : (
									col.label
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((item) => {
						const id = getId(item)
						const isSelected = selectedIds?.has(id) ?? false
						return (
							<tr
								key={id}
								className={cn(
									'border-b border-border transition-colors duration-150',
									onRowClick && 'cursor-pointer hover:bg-accent/50',
									isSelected && 'bg-accent/30',
								)}
								onClick={() => onRowClick?.(item)}
							>
								{hasSelection && (
									<td className="py-3 pr-2">
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => toggleOne(id)}
											onClick={(e) => e.stopPropagation()}
											className="rounded border-input"
											aria-label={`Select row ${id}`}
										/>
									</td>
								)}
								{columns.map((col) => (
									<td key={col.key} className={cn('py-3 pr-4', col.className)}>
										{col.render(item)}
									</td>
								))}
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
