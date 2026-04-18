import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Skeleton } from '@/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

// ─── Public API (unchanged — consumer-facing) ────────────────────────────────

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function SortIcon({
	sort,
	order,
	columnKey,
}: {
	sort: string | undefined
	order: 'asc' | 'desc' | undefined
	columnKey: string
}) {
	if (sort !== columnKey) return <ArrowUpDown className="h-3 w-3 opacity-40" />
	if (order === 'asc') return <ArrowUp className="h-3 w-3" />
	return <ArrowDown className="h-3 w-3" />
}

/** Convert our public Column<T> to TanStack ColumnDef<T>. */
function toColumnDefs<T>(
	cols: Column<T>[],
	hasSelection: boolean,
	selectedIds: Set<string> | undefined,
	onSelectionChange: ((ids: Set<string>) => void) | undefined,
	getId: (item: T) => string,
): ColumnDef<T>[] {
	const defs: ColumnDef<T>[] = []

	if (hasSelection) {
		defs.push({
			id: '__select__',
			meta: { className: 'w-10' },
			header: ({ table }) => {
				const allSelected = table.getRowCount() > 0 && table.getRowCount() === selectedIds?.size
				return (
					<input
						type="checkbox"
						checked={allSelected}
						onChange={() => {
							if (!onSelectionChange) return
							const allIds = new Set(table.getRowModel().rows.map((r) => getId(r.original)))
							onSelectionChange(allSelected ? new Set() : allIds)
						}}
						className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
						aria-label="Select all rows"
					/>
				)
			},
			cell: ({ row }) => {
				const id = getId(row.original)
				return (
					<input
						type="checkbox"
						checked={selectedIds?.has(id) ?? false}
						onChange={() => {
							if (!onSelectionChange || !selectedIds) return
							const next = new Set(selectedIds)
							if (next.has(id)) next.delete(id)
							else next.add(id)
							onSelectionChange(next)
						}}
						onClick={(e) => e.stopPropagation()}
						className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
						aria-label={`Select row ${id}`}
					/>
				)
			},
		})
	}

	for (const col of cols) {
		defs.push({
			id: col.key,
			header: col.label,
			cell: ({ row }) => col.render(row.original),
			enableSorting: col.sortable ?? false,
			meta: { className: col.className },
		})
	}

	return defs
}

// ─── Component ────────────────────────────────────────────────────────────────

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

	const columnDefs = useMemo(
		() => toColumnDefs(columns, hasSelection, selectedIds, onSelectionChange, getId),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[columns, hasSelection, selectedIds, onSelectionChange, getId],
	)

	const sortingState: SortingState = useMemo(
		() => (sort ? [{ id: sort, desc: order === 'desc' }] : []),
		[sort, order],
	)

	const table = useReactTable<T>({
		data,
		columns: columnDefs,
		getRowId: getId,
		getCoreRowModel: getCoreRowModel(),
		manualSorting: true,
		onSortingChange: (updater) => {
			const next = typeof updater === 'function' ? updater(sortingState) : updater
			const first = next[0]
			if (first && onSortChange) {
				onSortChange(first.id, first.desc ? 'desc' : 'asc')
			}
		},
		state: { sorting: sortingState },
	})

	// ── Loading skeleton ──────────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							{hasSelection && <TableHead />}
							{columns.map((col) => (
								<TableHead key={col.key} className={col.className}>
									{col.label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: skeletonRows }).map((_, i) => (
							<TableRow key={`skel-${i.toString()}`} className="hover:bg-transparent">
								{hasSelection && (
									<TableCell>
										<Skeleton className="h-4 w-4 rounded" />
									</TableCell>
								)}
								{columns.map((col) => (
									<TableCell key={col.key} className={col.className}>
										<Skeleton className="h-4 w-full max-w-[200px]" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	}

	// ── Empty state ───────────────────────────────────────────────────────────

	if (data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
				{emptyIcon && (
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						{emptyIcon}
					</div>
				)}
				<p className="mt-4 text-sm font-medium">{emptyMessage}</p>
				{emptyAction && <div className="mt-4">{emptyAction}</div>}
			</div>
		)
	}

	// ── Data table ────────────────────────────────────────────────────────────

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map((header) => {
								const meta = header.column.columnDef.meta as { className?: string } | undefined
								const canSort = header.column.getCanSort()
								return (
									<TableHead key={header.id} className={meta?.className}>
										{header.isPlaceholder ? null : canSort ? (
											<button
												type="button"
												onClick={header.column.getToggleSortingHandler()}
												className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-foreground"
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												<SortIcon sort={sort} order={order} columnKey={header.id} />
											</button>
										) : (
											flexRender(header.column.columnDef.header, header.getContext())
										)}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => {
						const isSelected = selectedIds?.has(row.id) ?? false
						return (
							<TableRow
								key={row.id}
								data-selected={isSelected}
								className={cn(onRowClick && 'cursor-pointer')}
								onClick={() => onRowClick?.(row.original)}
							>
								{row.getVisibleCells().map((cell) => {
									const meta = cell.column.columnDef.meta as { className?: string } | undefined
									return (
										<TableCell key={cell.id} className={meta?.className}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									)
								})}
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}
