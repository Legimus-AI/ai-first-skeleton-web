import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChatPage } from '../chat-page'

afterEach(cleanup)

describe('ChatPage (conversational reference)', () => {
	it('renders the seeded conversation message', () => {
		render(<ChatPage />)
		expect(screen.getByText(/conversational reference slice/i)).toBeTruthy()
	})

	it('appends a user message optimistically on send', () => {
		render(<ChatPage />)
		const input = screen.getByPlaceholderText('Write a message…')
		fireEvent.change(input, { target: { value: 'hello world' } })
		fireEvent.click(screen.getByLabelText('Enviar mensaje'))

		// Appears twice: the message bubble + the conversation-list preview (lastMessage).
		expect(screen.getAllByText('hello world').length).toBeGreaterThan(0)
	})
})
