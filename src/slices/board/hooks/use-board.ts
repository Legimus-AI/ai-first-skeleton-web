import { useMemo, useState } from 'react'

// ─── Board state — non-CRUD client store ─────────────────────────────────────
// Kanban is a custom-archetype slice (see DESIGN_BRIEF.md Layer 0). There is no
// board backend, so cards live in client state, seeded below. With a real backend:
// columns/cards → TanStack Query (queryOptions + route loader), moves/creates →
// useMutation with optimistic updates (see hooks/use-optimistic-mutation.ts).

export const COLUMNS = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'in-progress', title: 'In Progress' },
	{ id: 'done', title: 'Done' },
] as const

export type ColumnId = (typeof COLUMNS)[number]['id']

export interface BoardCard {
	id: string
	title: string
	description: string
	columnId: ColumnId
}

const COLUMN_ORDER: ColumnId[] = COLUMNS.map((column) => column.id)

const seedCards: BoardCard[] = [
	{
		id: 'card-1',
		title: 'Draft the launch announcement',
		description: 'Outline the key points for the v2 release post.',
		columnId: 'todo',
	},
	{
		id: 'card-2',
		title: 'Design empty states',
		description: 'Cover boards with zero cards and a single column.',
		columnId: 'todo',
	},
	{
		id: 'card-3',
		title: 'Wire drag-and-drop',
		description: 'Native HTML5 DnD with a button fallback for touch.',
		columnId: 'in-progress',
	},
	{
		id: 'card-4',
		title: 'Set up the project',
		description: 'Scaffold the board slice and route.',
		columnId: 'done',
	},
]

/** Index of a column in the left-to-right order, used to clamp move steps. */
function columnIndex(columnId: ColumnId): number {
	return COLUMN_ORDER.indexOf(columnId)
}

export function useBoard() {
	const [cards, setCards] = useState<BoardCard[]>(seedCards)

	const cardsByColumn = useMemo(() => {
		const grouped: Record<ColumnId, BoardCard[]> = { todo: [], 'in-progress': [], done: [] }
		for (const card of cards) grouped[card.columnId].push(card)
		return grouped
	}, [cards])

	function addCard(input: { title: string; description: string; columnId: ColumnId }) {
		const card: BoardCard = { id: crypto.randomUUID(), ...input }
		setCards((prev) => [...prev, card])
	}

	function moveCard(cardId: string, toColumn: ColumnId) {
		setCards((prev) =>
			prev.map((card) => (card.id === cardId ? { ...card, columnId: toColumn } : card)),
		)
	}

	/** Move a card one column left or right, clamped to the board edges. */
	function shiftCard(cardId: string, direction: -1 | 1) {
		setCards((prev) =>
			prev.map((card) => {
				if (card.id !== cardId) return card
				const nextIndex = columnIndex(card.columnId) + direction
				const nextColumn = COLUMN_ORDER[nextIndex]
				return nextColumn ? { ...card, columnId: nextColumn } : card
			}),
		)
	}

	return { cardsByColumn, addCard, moveCard, shiftCard }
}
