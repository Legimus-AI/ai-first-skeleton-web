import { cn } from '@/utils/cn'

// Reference non-CRUD slice: conversation data is client-state in this skeleton.
// With a real backend, replace with a TanStack Query hook (see use-todos.ts pattern):
//   conversationsQueryOptions → useConversations → loader ensureQueryData.

export interface Conversation {
	id: string
	title: string
	lastMessage: string
}

interface ConversationsProps {
	conversations: Conversation[]
	activeId: string | null
	onSelect: (id: string) => void
}

export function Conversations({ conversations, activeId, onSelect }: ConversationsProps) {
	if (conversations.length === 0) {
		return (
			<div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
				No conversations yet. Start one from the composer.
			</div>
		)
	}

	return (
		<ul className="flex flex-col gap-0.5 p-2" aria-label="Conversations">
			{conversations.map((conversation) => (
				<li key={conversation.id}>
					<button
						type="button"
						onClick={() => onSelect(conversation.id)}
						className={cn(
							'w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-150',
							conversation.id === activeId
								? 'bg-accent/10 text-foreground'
								: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
						)}
					>
						<span className="block truncate text-sm font-medium">{conversation.title}</span>
						<span className="block truncate text-xs text-muted-foreground">
							{conversation.lastMessage}
						</span>
					</button>
				</li>
			))}
		</ul>
	)
}
