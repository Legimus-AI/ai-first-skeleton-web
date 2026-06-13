import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SplitPane } from '../split-pane'

afterEach(cleanup)

describe('SplitPane', () => {
	it('renders both the list and detail panes', () => {
		render(<SplitPane list={<div>LIST PANE</div>} detail={<div>DETAIL PANE</div>} />)
		expect(screen.getByText('LIST PANE')).toBeTruthy()
		expect(screen.getByText('DETAIL PANE')).toBeTruthy()
	})

	it('uses aside + section for master-detail semantics', () => {
		const { container } = render(<SplitPane list={<span>L</span>} detail={<span>D</span>} />)
		expect(container.querySelector('aside')).toBeTruthy()
		expect(container.querySelector('section')).toBeTruthy()
	})

	it('stacks single-column by default and goes side-by-side at md', () => {
		const { container } = render(
			<SplitPane list={<span>L</span>} detail={<span>D</span>} listWidth="lg" />,
		)
		const grid = container.firstElementChild as HTMLElement
		expect(grid.className).toContain('grid-cols-1')
		expect(grid.className).toContain('md:grid-cols-[400px_1fr]')
	})
})
