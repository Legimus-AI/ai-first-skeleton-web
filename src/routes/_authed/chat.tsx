import { createFileRoute } from '@tanstack/react-router'
import { ChatPage } from '@/slices/chat/components/chat-page'

// conversational archetype: full-bleed, full-height two-pane surface. The bleed
// variant removes padding/max-width and bounds the height so SplitPane scrolls internally.
export const Route = createFileRoute('/_authed/chat')({
	context: () => ({ layout: 'bleed' as const }),
	component: ChatPage,
})
