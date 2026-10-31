import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const SITE_ORIGIN = 'https://app.example.com'

type WorkerListener = (event: unknown) => void

/** Runs public/sw.js against a fake worker scope; resolves to what a notification click opened. */
async function openedByClick(notificationUrl: unknown): Promise<string[]> {
	const listeners = new Map<string, WorkerListener>()
	const opened: string[] = []
	const scope = {
		location: { origin: SITE_ORIGIN },
		addEventListener: (type: string, listener: WorkerListener) => listeners.set(type, listener),
		clients: {
			matchAll: async () => [],
			openWindow: async (url: string) => opened.push(url),
		},
	}
	const workerSource = readFileSync(resolve(__dirname, '../../../public/sw.js'), 'utf-8')
	new Function('self', workerSource)(scope)

	let clickWork: Promise<unknown> = Promise.resolve()
	listeners.get('notificationclick')?.({
		notification: { close: vi.fn(), data: { url: notificationUrl } },
		waitUntil: (work: Promise<unknown>) => {
			clickWork = work
		},
	})
	await clickWork
	return opened
}

describe('service worker notification click', () => {
	it('opens a page of this site', async () => {
		expect(await openedByClick('/settings/team')).toEqual([`${SITE_ORIGIN}/settings/team`])
	})

	it.each([
		'https://evil.example/phish',
		'//evil.example',
		'javascript:alert(1)',
		'data:text/html,hi',
		undefined,
	])('opens nothing for %s', async (notificationUrl) => {
		expect(await openedByClick(notificationUrl)).toEqual([])
	})
})
