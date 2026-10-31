import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api-client'
import { uploadToPresignedUrl } from '@/services/upload-service'
import { useUploadFile } from '../use-files'

vi.mock('@/services/api-client', () => ({ api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }))
vi.mock('@/services/upload-service', () => ({ uploadToPresignedUrl: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const FILE_ID = '019a3b7e-0000-7000-8000-000000000001'
const upload = {
	url: 'https://bucket.example/org/1/2',
	method: 'PUT',
	headers: { 'Content-Type': 'image/png' },
	expiresAt: '2026-10-31T12:10:00.000Z',
}

function fileRow(status: 'pending' | 'ready' | 'rejected') {
	return {
		id: FILE_ID,
		filename: 'logo.png',
		contentType: 'image/png',
		size: 4,
		status,
		rejectReason: status === 'rejected' ? 'CONTENT_MISMATCH' : null,
		createdAt: '2026-10-31T12:00:00.000Z',
		updatedAt: '2026-10-31T12:00:00.000Z',
	}
}

function respond(body: unknown, status = 200) {
	return Promise.resolve(Response.json(body, { status }))
}

function wrapper({ children }: { children: ReactNode }) {
	const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
	return createElement(QueryClientProvider, { client }, children)
}

describe('useUploadFile', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates the upload, PUTs the File to the returned target, then completes it', async () => {
		vi.mocked(api.post)
			.mockReturnValueOnce(respond({ data: { file: fileRow('pending'), upload } }, 201))
			.mockReturnValueOnce(respond({ data: fileRow('ready') }))
		const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'logo.png', {
			type: 'image/png',
		})

		const { result } = renderHook(() => useUploadFile(), { wrapper })
		result.current.mutate(file)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(vi.mocked(api.post).mock.calls).toEqual([
			['/api/v1/files', { filename: 'logo.png', contentType: 'image/png', size: 4 }],
			[`/api/v1/files/${FILE_ID}/complete`, {}],
		])
		expect(uploadToPresignedUrl).toHaveBeenCalledWith(upload, file)
		// Completing before the bytes are in the bucket would only ever answer 409.
		const [putOrder] = vi.mocked(uploadToPresignedUrl).mock.invocationCallOrder
		const [, completeOrder] = vi.mocked(api.post).mock.invocationCallOrder
		expect(putOrder).toBeLessThan(completeOrder ?? 0)
		expect(result.current.data?.status).toBe('ready')
	})

	it('fails when the API rejects the uploaded bytes', async () => {
		vi.mocked(api.post)
			.mockReturnValueOnce(respond({ data: { file: fileRow('pending'), upload } }, 201))
			.mockReturnValueOnce(respond({ data: fileRow('rejected') }))

		const { result } = renderHook(() => useUploadFile(), { wrapper })
		result.current.mutate(new File(['<html>'], 'logo.png', { type: 'image/png' }))

		await waitFor(() => expect(result.current.isError).toBe(true))
	})
})
