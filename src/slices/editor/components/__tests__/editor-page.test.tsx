import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { EditorPage } from '../editor-page'

afterEach(cleanup)

describe('EditorPage (focused-tool reference)', () => {
	it('shows a live word count of the body', () => {
		render(<EditorPage />)
		expect(screen.getByText(/\d+ words/)).toBeTruthy()
	})

	it('marks unsaved on edit, then saved after Save, with an updated count', () => {
		render(<EditorPage />)
		const body = screen.getByLabelText('Document body')
		fireEvent.change(body, { target: { value: 'one two three' } })

		expect(screen.getByText('Unsaved changes')).toBeTruthy()

		fireEvent.click(screen.getByText('Save'))

		expect(screen.getByText('Saved')).toBeTruthy()
		expect(screen.getByText('3 words')).toBeTruthy()
	})
})
