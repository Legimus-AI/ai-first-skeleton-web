import { SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { cn } from '@/utils/cn'

export interface ChatMessage {
	id: string
	author: 'user' | 'agent'
	text: string
}

interface ChatViewProps {
	messages: ChatMessage[]
	onSend: (text: string) => void
	/** Conversation title shown in the pane header. */
	title: string
}

export function ChatView({ messages, onSend, title }: ChatViewProps) {
	const [draft, setDraft] = useState('')

	function submit() {
		const text = draft.trim()
		if (!text) return
		onSend(text)
		setDraft('')
	}

	return (
		<div className="flex h-full min-h-0 flex-col">
			<header className="border-b border-border px-4 py-3">
				<h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
			</header>

			<div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
						Send a message to start the conversation.
					</div>
				) : (
					messages.map((message) => (
						<p
							key={message.id}
							className={cn(
								'max-w-[70%] rounded-lg px-3 py-2 text-sm',
								message.author === 'user'
									? 'ml-auto bg-primary text-primary-foreground'
									: 'bg-muted text-foreground',
							)}
						>
							{message.text}
						</p>
					))
				)}
			</div>

			<div className="flex gap-2 border-t border-border p-3">
				<Input
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => event.key === 'Enter' && submit()}
					placeholder="Write a message…"
					aria-label="Message"
				/>
				<Button onClick={submit} size="icon" aria-label="Enviar mensaje">
					<SendHorizontal className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
