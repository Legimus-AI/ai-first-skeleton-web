import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BoardPage } from '../board-page'

afterEach(cleanup)

describe('BoardPage (custom-archetype reference)', () => {
	it('renders the three columns', () => {
		render(<BoardPage />)
		expect(screen.getByText('Por hacer')).toBeTruthy()
		expect(screen.getByText('En curso')).toBeTruthy()
		expect(screen.getByText('Hecho')).toBeTruthy()
	})

	it('renders seeded cards across the columns', () => {
		render(<BoardPage />)
		expect(screen.getByText('Redactar el anuncio de lanzamiento')).toBeTruthy()
		expect(screen.getByText('Conectar arrastrar y soltar')).toBeTruthy()
		expect(screen.getByText('Preparar el proyecto')).toBeTruthy()
	})
})
