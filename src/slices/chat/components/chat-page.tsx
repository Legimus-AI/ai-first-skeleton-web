import { useState } from 'react'
import { DemoNotice } from '@/ui/demo-notice'
import { SplitPane } from '@/ui/split-pane'
import type { ChatMessage } from './chat-view'
import { ChatView } from './chat-view'
import type { Conversation } from './conversations'
import { Conversations } from './conversations'

// ─── Chat Page — non-CRUD reference slice ────────────────────────────────────
// Demonstrates the `conversational` archetype: SplitPane composition, optimistic
// local append, empty states, semantic tokens. No DataTable, no CRUD contract —
// CORE invariants still apply in full (see INVARIANTS.md "Rule Layers").
//
// This skeleton has no chat backend, so conversations are client state. With a
// real backend: conversations → TanStack Query (queryOptions factory + loader),
// sends → useMutation with optimistic update (see use-optimistic-mutation.ts).

const seedConversations: Conversation[] = [
	{
		id: 'welcome',
		title: 'Bienvenida',
		lastMessage: 'Prueba enviar un mensaje abajo.',
	},
]

const seedMessages: Record<string, ChatMessage[]> = {
	welcome: [
		{
			id: 'welcome-1',
			author: 'agent',
			text: 'Este es el ejemplo conversacional. Los mensajes aparecen al instante en el estado local.',
		},
	],
}

export function ChatPage() {
	const [conversations, setConversations] = useState(seedConversations)
	const [messagesById, setMessagesById] = useState(seedMessages)
	const [activeId, setActiveId] = useState<string | null>('welcome')

	const activeConversation =
		conversations.find((conversation) => conversation.id === activeId) ?? null
	const activeMessages = activeId ? (messagesById[activeId] ?? []) : []

	function sendMessage(text: string) {
		if (!activeId) return
		const userMessage: ChatMessage = { id: crypto.randomUUID(), author: 'user', text }
		setMessagesById((prev) => ({
			...prev,
			[activeId]: [...(prev[activeId] ?? []), userMessage],
		}))
		setConversations((prev) =>
			prev.map((conversation) =>
				conversation.id === activeId ? { ...conversation, lastMessage: text } : conversation,
			),
		)
	}

	return (
		<>
			<DemoNotice className="m-3 mb-0" />
			<SplitPane
				listWidth="md"
				list={
					<Conversations conversations={conversations} activeId={activeId} onSelect={setActiveId} />
				}
				detail={
					activeConversation ? (
						<ChatView
							title={activeConversation.title}
							messages={activeMessages}
							onSend={sendMessage}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
							Elige una conversación para empezar.
						</div>
					)
				}
			/>
		</>
	)
}
