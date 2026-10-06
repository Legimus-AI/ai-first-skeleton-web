// DataTable owns every view of a list (skeleton, empty, desktop table, mobile cards) so the
// CRUD slices share one selection, sorting and responsive behaviour; split only if a view grows.
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@/ui/icons'
import { Skeleton } from '@/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { cn } from '@/utils/cn'

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
	/** Rows that may be selected; the rest get no checkbox (e.g. yourself in a team list). */
	canSelect?: (item: T) => boolean
	/** Human name of a row for screen readers ("Seleccionar <name>"); never an id. */
	getRowLabel?: (item: T) => string
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

const CHECKBOX_CLASS =
	'h-4 w-4 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Visible at the base breakpoint: shown in the mobile card (secondary columns use `hidden sm:...`). */
function isBaseVisible<T>(col: Column<T>): boolean {
	return !/(^|\s)hidden(\s|$)/.test(col.className ?? '')
}

const selectAnyRow = () => true
const genericRowLabel = () => 'fila'

interface Selection<T> {
	selectedIds: Set<string> | undefined
	onSelectionChange: ((ids: Set<string>) => void) | undefined
	canSelect: (item: T) => boolean
	getId: (item: T) => string
	getRowLabel: (item: T) => string
}

function RowCheckbox<T>({ item, selection }: { item: T; selection: Selection<T> }) {
	const { selectedIds, onSelectionChange, canSelect, getId, getRowLabel } = selection
	if (!canSelect(item)) return null
	const id = getId(item)
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
			className={CHECKBOX_CLASS}
			aria-label={`Seleccionar ${getRowLabel(item)}`}
		/>
	)
}

/** Convert our public Column<T> to TanStack ColumnDef<T>. */
function toColumnDefs<T>(
	cols: Column<T>[],
	hasSelection: boolean,
	selection: Selection<T>,
): ColumnDef<T>[] {
	const defs: ColumnDef<T>[] = []

	if (hasSelection) {
		defs.push({
			id: '__select__',
			meta: { className: 'w-10' },
			header: ({ table }) => {
				const selectableIds = table
					.getRowModel()
					.rows.filter((r) => selection.canSelect(r.original))
					.map((r) => selection.getId(r.original))
				if (selectableIds.length === 0) return null
				const allSelected = selectableIds.every((id) => selection.selectedIds?.has(id))
				return (
					<input
						type="checkbox"
						checked={allSelected}
						onChange={() =>
							selection.onSelectionChange?.(new Set(allSelected ? [] : selectableIds))
						}
						className={CHECKBOX_CLASS}
						aria-label="Seleccionar todas las filas"
					/>
				)
			},
			cell: ({ row }) => <RowCheckbox item={row.original} selection={selection} />,
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
	canSelect = selectAnyRow,
	getRowLabel = genericRowLabel,
	sort,
	order,
	onSortChange,
	emptyMessage = 'No hay resultados.',
	emptyAction,
	emptyIcon,
	skeletonRows = 5,
}: DataTableProps<T>) {
	const hasSelection = onSelectionChange !== undefined

	const selection = useMemo<Selection<T>>(
		() => ({ selectedIds, onSelectionChange, canSelect, getId, getRowLabel }),
		[selectedIds, onSelectionChange, canSelect, getId, getRowLabel],
	)
	const columnDefs = useMemo(
		() => toColumnDefs(columns, hasSelection, selection),
		[columns, hasSelection, selection],
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
		// asc ⇄ desc only: a third "unsorted" click would leave the URL sort unchanged (a dead click).
		enableSortingRemoval: false,
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
				{emptyIcon}
				<p className="mt-4 text-sm font-medium">{emptyMessage}</p>
				{emptyAction && <div className="mt-4">{emptyAction}</div>}
			</div>
		)
	}

	// ── Data table (sm+) and stacked cards (mobile) ───────────────────────────

	const cardColumns = columns.filter(isBaseVisible)
	const primaryKey = cardColumns.find((col) => col.label)?.key

	return (
		<>
			<div className="hidden overflow-x-auto sm:block">
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
			<ul className="divide-y divide-border/50 sm:hidden">
				{table.getRowModel().rows.map((row) => (
					<li
						key={row.id}
						data-selected={selectedIds?.has(row.id) ?? false}
						className="flex items-start gap-3 px-4 py-3 data-[selected=true]:bg-muted/50"
					>
						{hasSelection && (
							<div className="pt-0.5">
								<RowCheckbox item={row.original} selection={selection} />
							</div>
						)}
						{cardColumns.map((col) => (
							<div
								key={col.key}
								className={col.key === primaryKey ? 'min-w-0 flex-1 break-words' : 'shrink-0'}
							>
								{col.key === primaryKey && onRowClick ? (
									<button
										type="button"
										className="w-full text-left"
										onClick={() => onRowClick(row.original)}
									>
										{col.render(row.original)}
									</button>
								) : (
									col.render(row.original)
								)}
							</div>
						))}
					</li>
				))}
			</ul>
		</>
	)
}
