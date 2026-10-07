import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Column, DataTable } from '../data-table'

afterEach(cleanup)

type Row = { id: string; title: string }
const rows: Row[] = [{ id: '1', title: 'Pan' }]
const columns: Column<Row>[] = [
	{ key: 'title', label: 'Título', render: (row) => row.title, sortable: true },
]

function renderSorted(sorting: { sort?: string; order?: 'asc' | 'desc' }) {
	const onSortChange = vi.fn()
	render(
		<DataTable
			data={rows}
			columns={columns}
			getId={(row) => row.id}
			onSortChange={onSortChange}
			{...sorting}
		/>,
	)
	return { header: screen.getByRole('columnheader', { name: /título/i }), onSortChange }
}

describe('DataTable sorting', () => {
	it.each([
		['an unsorted column', {}, 'asc'],
		['the ascending column', { sort: 'title', order: 'asc' }, 'desc'],
		['the descending column', { sort: 'title', order: 'desc' }, 'asc'],
		['the sorted column without an order', { sort: 'title' }, 'asc'],
	] as const)('a header click on %s asks for %s', (_case, sorting, next) => {
		const { onSortChange } = renderSorted(sorting)
		fireEvent.click(screen.getByRole('button', { name: /título/i }))
		expect(onSortChange).toHaveBeenCalledWith('title', next)
	})

	it('tells screen readers which way the sorted column runs', () => {
		expect(renderSorted({ sort: 'title', order: 'asc' }).header.getAttribute('aria-sort')).toBe(
			'ascending',
		)
		cleanup()
		expect(renderSorted({}).header.getAttribute('aria-sort')).toBeNull()
	})
})
