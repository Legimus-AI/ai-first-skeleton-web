import { createFileRoute } from '@tanstack/react-router'
import { ChatPage } from '@/slices/chat/components/chat-page'

export const Route = createFileRoute('/_authed/chat')({
	component: ChatPage,
})
