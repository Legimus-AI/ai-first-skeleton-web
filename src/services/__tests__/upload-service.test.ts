import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadToPresignedUrl } from '@/services/upload-service'

afterEach(() => vi.unstubAllGlobals())

describe('uploadToPresignedUrl', () => {
	it('PUTs the File itself with the signed headers except Content-Length, without cookies', async () => {
		const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(null))
		vi.stubGlobal('fetch', fetchMock)
		const file = new File(['%PDF-1.7'], 'informe.pdf', { type: 'application/pdf' })

		await uploadToPresignedUrl(
			{
				url: 'https://bucket.example/org/1/2?X-Amz-Signature=abc',
				method: 'PUT',
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': 'attachment',
					'If-None-Match': '*',
					'Content-Length': '8',
				},
				expiresAt: '2026-10-31T12:10:00.000Z',
			},
			file,
		)

		const [url, init] = fetchMock.mock.calls[0] ?? []
		expect(url).toBe('https://bucket.example/org/1/2?X-Amz-Signature=abc')
		expect(init?.method).toBe('PUT')
		expect(init?.body).toBe(file)
		expect(init?.credentials).toBe('omit')
		const sent = new Headers(init?.headers)
		expect(Object.fromEntries(sent)).toEqual({
			'content-type': 'application/pdf',
			'content-disposition': 'attachment',
			'if-none-match': '*',
		})
	})
})
