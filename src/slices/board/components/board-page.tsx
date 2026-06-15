import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { COLUMNS, type ColumnId, useBoard } from '../hooks/use-board'
import { BoardColumn } from './board-column'
import { CreateCardDialog } from './create-card-dialog'

// ─── Board Page — custom-archetype reference (kanban) ─────────────────────────
// Spatial board surface: cards move across To Do / In Progress / Done via native
// drag-and-drop, with per-card move buttons as the keyboard/touch fallback. Pairs
// with the authed-layout shell + the `bleed` ContentArea variant so columns own
// their own scroll. No *-list.tsx → PATTERN: CRUD does not apply (INVARIANTS.md
// "Rule Layers"); CORE invariants (tokens, a11y, type-safety) apply in full.

const LAST_COLUMN_INDEX = COLUMNS.length - 1

export function BoardPage() {
	const { cardsByColumn, addCard, moveCard, shiftCard } = useBoard()
	const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
	const [dialogColumn, setDialogColumn] = useState<ColumnId | null>(null)

	const dialogColumnTitle = COLUMNS.find((column) => column.id === dialogColumn)?.title ?? ''

	return (
		<div className="flex h-full min-h-0 flex-col gap-4">
			<header className="flex items-center gap-2.5 px-1">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<LayoutGrid className="h-4 w-4" />
				</div>
				<div>
					<h1 className="text-lg font-semibold tracking-tight text-foreground">Board</h1>
					<p className="text-xs text-muted-foreground">
						Drag cards between columns, or use the move buttons on each card.
					</p>
				</div>
			</header>

			<div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
				{COLUMNS.map((column, index) => (
					<BoardColumn
						key={column.id}
						columnId={column.id}
						title={column.title}
						cards={cardsByColumn[column.id]}
						canMoveLeft={index > 0}
						canMoveRight={index < LAST_COLUMN_INDEX}
						draggingCardId={draggingCardId}
						onShift={shiftCard}
						onDropCard={moveCard}
						onDragStart={setDraggingCardId}
						onDragEnd={() => setDraggingCardId(null)}
						onAddCard={setDialogColumn}
					/>
				))}
			</div>

			{dialogColumn && (
				<CreateCardDialog
					open={dialogColumn !== null}
					columnId={dialogColumn}
					columnTitle={dialogColumnTitle}
					onOpenChange={(open) => !open && setDialogColumn(null)}
					onCreate={addCard}
				/>
			)}
		</div>
	)
}
