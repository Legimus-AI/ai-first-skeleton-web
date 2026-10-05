import { PER_PAGE_OPTIONS } from '@/hooks/use-query-params'
import { Button } from '@/ui/button'
import { ChevronLeft, ChevronRight } from '@/ui/icons'
import { cn } from '@/utils/cn'

interface PaginationMeta {
	page: number
	totalPages: number
	total: number
	hasMore: boolean
	limit?: number
}

interface PaginationProps {
	meta: PaginationMeta | undefined
	onPageChange: (page: number) => void
	onPerPageChange?: (perPage: number) => void
	perPageOptions?: readonly number[]
}

function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
	if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
	const pages: (number | 'ellipsis')[] = [1]
	if (current > 3) pages.push('ellipsis')
	const start = Math.max(2, current - 1)
	const end = Math.min(total - 1, current + 1)
	for (let i = start; i <= end; i++) pages.push(i)
	if (current < total - 2) pages.push('ellipsis')
	if (total > 1) pages.push(total)
	return pages
}

export function Pagination({
	meta,
	onPageChange,
	onPerPageChange,
	perPageOptions = PER_PAGE_OPTIONS,
}: PaginationProps) {
	if (!meta) return null

	const limit = meta.limit ?? 15
	const start = (meta.page - 1) * limit + 1
	const end = Math.min(meta.page * limit, meta.total)
	const pages = getPageRange(meta.page, meta.totalPages)

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-xs text-muted-foreground">
				{meta.total === 0
					? '0 resultados'
					: `Mostrando ${start}–${end} de ${meta.total} resultado${meta.total === 1 ? '' : 's'}`}
			</p>
			<div className="flex flex-wrap items-center gap-1.5">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					disabled={meta.page <= 1}
					onClick={() => onPageChange(meta.page - 1)}
					aria-label="Página anterior"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{pages.map((p, i) =>
					p === 'ellipsis' ? (
						<span key={`ellipsis-${i.toString()}`} className="px-1 text-xs text-muted-foreground">
							...
						</span>
					) : (
						<Button
							key={p}
							variant={p === meta.page ? 'secondary' : 'ghost'}
							size="icon"
							className={cn('h-8 w-8 text-xs', p === meta.page && 'font-semibold')}
							onClick={() => onPageChange(p)}
							aria-label={`Página ${p}`}
							aria-current={p === meta.page ? 'page' : undefined}
						>
							{p}
						</Button>
					),
				)}

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					disabled={!meta.hasMore}
					onClick={() => onPageChange(meta.page + 1)}
					aria-label="Página siguiente"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				{onPerPageChange && (
					<select
						value={limit}
						onChange={(e) => onPerPageChange(Number(e.target.value))}
						className="ml-2 h-8 rounded-control border border-input bg-background px-2 text-xs text-foreground"
						aria-label="Resultados por página"
					>
						{perPageOptions.map((n) => (
							<option key={n} value={n}>
								{n} / pág
							</option>
						))}
					</select>
				)}
			</div>
		</div>
	)
}
