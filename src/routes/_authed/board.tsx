import { createFileRoute } from '@tanstack/react-router'
import { BoardPage } from '@/slices/board/components/board-page'

// custom archetype (kanban): full-bleed, full-height board surface. The bleed variant
// removes padding/max-width and bounds the height so the columns scroll internally.
export const Route = createFileRoute('/_authed/board')({
	context: () => ({ layout: 'bleed' as const }),
	component: BoardPage,
})
