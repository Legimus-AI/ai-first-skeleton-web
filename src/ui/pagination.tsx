import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/ui/button'

interface PaginationMeta {
	page: number
	totalPages: number
	total: number
	hasMore: boolean
}

interface PaginationProps {
	meta: PaginationMeta | undefined
	onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
	if (!meta || meta.totalPages <= 1) return null

	return (
		<div className="mt-4 flex items-center justify-between">
			<p className="text-xs text-muted-foreground">
				Page {meta.page} of {meta.totalPages} ({meta.total} items)
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={meta.page <= 1}
					onClick={() => onPageChange(meta.page - 1)}
				>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!meta.hasMore}
					onClick={() => onPageChange(meta.page + 1)}
				>
					Next
					<ChevronRight className="ml-1 h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
