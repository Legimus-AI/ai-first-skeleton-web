import { useMemo, useState } from 'react'

// ─── Board state — non-CRUD client store ─────────────────────────────────────
// Kanban is a custom-archetype slice (see DESIGN_BRIEF.md Layer 0). There is no
// board backend, so cards live in client state, seeded below. With a real backend:
// columns/cards → TanStack Query (queryOptions + route loader), moves/creates →
// useMutation with optimistic updates (see hooks/use-optimistic-mutation.ts).

export const COLUMNS = [
	{ id: 'todo', title: 'Por hacer' },
	{ id: 'in-progress', title: 'En curso' },
	{ id: 'done', title: 'Hecho' },
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
		title: 'Redactar el anuncio de lanzamiento',
		description: 'Resumir los puntos clave del post de la versión 2.',
		columnId: 'todo',
	},
	{
		id: 'card-2',
		title: 'Diseñar los estados vacíos',
		description: 'Cubrir tableros sin tarjetas y con una sola columna.',
		columnId: 'todo',
	},
	{
		id: 'card-3',
		title: 'Conectar arrastrar y soltar',
		description: 'Drag and drop nativo de HTML5 con botones como alternativa táctil.',
		columnId: 'in-progress',
	},
	{
		id: 'card-4',
		title: 'Preparar el proyecto',
		description: 'Crear el slice del tablero y su ruta.',
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
