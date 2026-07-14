import { afterEach, describe, expect, it } from 'vitest'
import { getFloatingListboxContainer, getFloatingListboxStyle } from './floating-listbox'

const originalClientWidth = Object.getOwnPropertyDescriptor(document.documentElement, 'clientWidth')
const originalInnerHeight = window.innerHeight

function setViewport(width: number, height: number) {
	Object.defineProperty(document.documentElement, 'clientWidth', {
		configurable: true,
		value: width,
	})
	Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

function setRect(element: HTMLElement, rect: Partial<DOMRect>) {
	element.getBoundingClientRect = () => ({
		x: 0,
		y: 0,
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		toJSON: () => ({}),
		...rect,
	})
}

afterEach(() => {
	document.body.replaceChildren()
	if (originalClientWidth) {
		Object.defineProperty(document.documentElement, 'clientWidth', originalClientWidth)
	}
	Object.defineProperty(window, 'innerHeight', {
		configurable: true,
		value: originalInnerHeight,
	})
})

describe('floating listbox', () => {
	it('uses fixed viewport coordinates inside transformed dialogs', () => {
		setViewport(1000, 800)
		const dialog = document.createElement('div')
		const trigger = document.createElement('div')
		dialog.append(trigger)
		document.body.append(dialog)
		setRect(trigger, { left: 100, top: 100, right: 400, bottom: 140, width: 300, height: 40 })

		expect(getFloatingListboxContainer(trigger)).toBe(document.body)
		expect(getFloatingListboxStyle({ triggerElement: trigger })).toMatchObject({
			position: 'fixed',
			left: 100,
			top: 146,
			width: 300,
		})
	})
})
