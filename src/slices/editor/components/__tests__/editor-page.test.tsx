import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { EditorPage } from '../editor-page'

afterEach(cleanup)

describe('EditorPage (focused-tool reference)', () => {
	it('shows a live word count of the body', () => {
		render(<EditorPage />)
		expect(screen.getByText(/\d+ palabras/)).toBeTruthy()
	})

	it('updates the word count as the body changes, and never claims to have saved', () => {
		render(<EditorPage />)
		const body = screen.getByLabelText('Contenido del documento')
		fireEvent.change(body, { target: { value: 'uno dos tres' } })

		expect(screen.getByText('3 palabras')).toBeTruthy()
		expect(screen.queryByText(/guardado|saved/i)).toBeNull()
	})
})
