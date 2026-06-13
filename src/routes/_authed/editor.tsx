import { createFileRoute } from '@tanstack/react-router'
import { EditorPage } from '@/slices/editor/components/editor-page'

// focused-tool archetype: single-artifact composer. The 'narrow' variant centers
// the content (max-w-2xl) so it reads like a document, the way focused-layout intends.
export const Route = createFileRoute('/_authed/editor')({
	context: () => ({ layout: 'narrow' as const }),
	component: EditorPage,
})
