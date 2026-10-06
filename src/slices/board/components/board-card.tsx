import { Button } from '@/ui/button'
import { ChevronLeft, ChevronRight, GripVertical } from '@/ui/icons'
import { cn } from '@/utils/cn'
import type { BoardCard as BoardCardData } from '../hooks/use-board'

interface BoardCardProps {
	card: BoardCardData
	canMoveLeft: boolean
	canMoveRight: boolean
	onShift: (cardId: string, direction: -1 | 1) => void
	onDragStart: (cardId: string) => void
	onDragEnd: () => void
	isDragging: boolean
}

export function BoardCard({
	card,
	canMoveLeft,
	canMoveRight,
	onShift,
	onDragStart,
	onDragEnd,
	isDragging,
}: BoardCardProps) {
	return (
		<article
			draggable
			onDragStart={(event) => {
				event.dataTransfer.effectAllowed = 'move'
				event.dataTransfer.setData('text/plain', card.id)
				onDragStart(card.id)
			}}
			onDragEnd={onDragEnd}
			className={cn(
				'group cursor-grab rounded-control bg-card p-3 shadow-control transition-[transform,box-shadow] duration-150 ease-standard',
				'hover:-translate-y-0.5 hover:shadow-surface active:cursor-grabbing',
				'focus-within:ring-2 focus-within:ring-ring/40',
				isDragging && 'rotate-1 opacity-50',
			)}
		>
			<div className="flex items-start gap-2">
				<GripVertical
					className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
					aria-hidden="true"
				/>
				<div className="min-w-0 flex-1">
					<h3 className="text-sm font-medium leading-snug tracking-tight text-foreground break-words">
						{card.title}
					</h3>
					{card.description && (
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground break-words">
							{card.description}
						</p>
					)}
				</div>
			</div>

			<div className="mt-2 flex items-center justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					disabled={!canMoveLeft}
					onClick={() => onShift(card.id, -1)}
					aria-label={`Mover "${card.title}" a la columna anterior`}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					disabled={!canMoveRight}
					onClick={() => onShift(card.id, 1)}
					aria-label={`Mover "${card.title}" a la columna siguiente`}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</article>
	)
}
