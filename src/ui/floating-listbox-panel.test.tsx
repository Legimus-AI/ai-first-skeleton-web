import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useId, useRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/ui/dialog'
import { FloatingListboxPanel } from '@/ui/floating-listbox-panel'

afterEach(cleanup)

function ListboxInsideDialog() {
	const triggerRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const listboxId = useId()

	return (
		<Dialog open>
			<DialogContent>
				<DialogTitle>Selector test</DialogTitle>
				<DialogDescription>Verifies nested modal scrolling.</DialogDescription>
				<button ref={triggerRef} type="button">
					Open options
				</button>
				<FloatingListboxPanel
					open
					triggerRef={triggerRef}
					dropdownRef={dropdownRef}
					listboxId={listboxId}
				>
					<button type="button" role="option">
						First option
					</button>
				</FloatingListboxPanel>
			</DialogContent>
		</Dialog>
	)
}

describe('FloatingListboxPanel', () => {
	it('allows wheel scrolling inside a body portal while the dialog lock is active', () => {
		render(<ListboxInsideDialog />)
		const listbox = screen.getByRole('listbox')
		listbox.style.overflowY = 'auto'
		Object.defineProperties(listbox, {
			clientHeight: { configurable: true, value: 200 },
			scrollHeight: { configurable: true, value: 800 },
		})

		expect(
			fireEvent.wheel(screen.getByRole('option'), {
				bubbles: true,
				cancelable: true,
				deltaY: 40,
			}),
		).toBe(true)
	})
})
