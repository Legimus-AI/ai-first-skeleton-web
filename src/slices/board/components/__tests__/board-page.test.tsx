import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BoardPage } from '../board-page'

afterEach(cleanup)

describe('BoardPage (custom-archetype reference)', () => {
	it('renders the three columns', () => {
		render(<BoardPage />)
		expect(screen.getByText('To Do')).toBeTruthy()
		expect(screen.getByText('In Progress')).toBeTruthy()
		expect(screen.getByText('Done')).toBeTruthy()
	})

	it('renders seeded cards across the columns', () => {
		render(<BoardPage />)
		expect(screen.getByText('Draft the launch announcement')).toBeTruthy()
		expect(screen.getByText('Wire drag-and-drop')).toBeTruthy()
		expect(screen.getByText('Set up the project')).toBeTruthy()
	})
})
