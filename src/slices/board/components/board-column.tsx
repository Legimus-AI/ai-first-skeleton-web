import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { cn } from '@/utils/cn'
import type { BoardCard as BoardCardData, ColumnId } from '../hooks/use-board'
import { BoardCard } from './board-card'

interface BoardColumnProps {
	columnId: ColumnId
	title: string
	cards: BoardCardData[]
	canMoveLeft: boolean
	canMoveRight: boolean
	draggingCardId: string | null
	onShift: (cardId: string, direction: -1 | 1) => void
	onDropCard: (cardId: string, toColumn: ColumnId) => void
	onDragStart: (cardId: string) => void
	onDragEnd: () => void
	onAddCard: (columnId: ColumnId) => void
}

export function BoardColumn({
	columnId,
	title,
	cards,
	canMoveLeft,
	canMoveRight,
	draggingCardId,
	onShift,
	onDropCard,
	onDragStart,
	onDragEnd,
	onAddCard,
}: BoardColumnProps) {
	const [isDropTarget, setIsDropTarget] = useState(false)

	return (
		<section
			aria-label={title}
			className="flex w-72 shrink-0 flex-col sm:w-80"
			onDragOver={(event) => {
				event.preventDefault()
				event.dataTransfer.dropEffect = 'move'
				setIsDropTarget(true)
			}}
			onDragLeave={(event) => {
				// Only clear when the pointer actually leaves the column, not its children.
				if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDropTarget(false)
			}}
			onDrop={(event) => {
				event.preventDefault()
				setIsDropTarget(false)
				const cardId = event.dataTransfer.getData('text/plain')
				if (cardId) onDropCard(cardId, columnId)
			}}
		>
			<header className="flex items-center justify-between px-1 pb-2">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
					<Badge variant="secondary" className="tabular-nums">
						{cards.length}
					</Badge>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={() => onAddCard(columnId)}
					aria-label={`Add a card to ${title}`}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</header>

			<div
				className={cn(
					'flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-dashed border-transparent bg-muted/40 p-2 transition-colors',
					'overflow-y-auto [content-visibility:auto]',
					isDropTarget && 'border-border bg-accent/60',
				)}
			>
				{cards.length === 0 ? (
					<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
						{isDropTarget ? 'Drop here' : 'No cards yet — drag one over or add a card.'}
					</div>
				) : (
					cards.map((card) => (
						<BoardCard
							key={card.id}
							card={card}
							canMoveLeft={canMoveLeft}
							canMoveRight={canMoveRight}
							onShift={onShift}
							onDragStart={onDragStart}
							onDragEnd={onDragEnd}
							isDragging={draggingCardId === card.id}
						/>
					))
				)}
			</div>
		</section>
	)
}
