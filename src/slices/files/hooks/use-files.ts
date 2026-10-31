import {
	createUploadResponseSchema,
	type FileListQuery,
	type FileView,
	fileDownloadResponseSchema,
	fileListResponseSchema,
	fileResponseSchema,
} from '@repo/shared'
import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { ApiError, safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'
import { uploadToPresignedUrl } from '@/services/upload-service'
import { safeUrl } from '@/utils/safe-url'

export const FILES_KEY = ['files'] as const

const REJECTED_MESSAGE = 'No pudimos verificar tu archivo; vuelve a intentarlo.'

/** The API answers 400 with the offending field for a size or type it does not accept. */
export function fileErrorMessage(error: unknown): string {
	if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
		if (error.fields?.size) return 'El archivo supera el tamaño máximo.'
		if (error.fields?.contentType) return 'Este tipo de archivo no está permitido.'
	}
	return error instanceof Error && error.message === REJECTED_MESSAGE
		? REJECTED_MESSAGE
		: toUserMessage(error)
}

export const filesQueryOptions = (params?: Partial<FileListQuery>) =>
	queryOptions({
		queryKey: [...FILES_KEY, params],
		queryFn: async ({ signal }) => {
			const res = await api.get('/api/v1/files', params, signal)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(fileListResponseSchema, json)
		},
		placeholderData: keepPreviousData,
	})

export function useFiles(params?: Partial<FileListQuery>) {
	return useQuery(filesQueryOptions(params))
}

/** Create the upload, PUT the bytes to the bucket, then let the API verify them; resolves to a `ready` file. */
export function useUploadFile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (file: File): Promise<FileView> => {
			const created = await api.post('/api/v1/files', {
				filename: file.name,
				contentType: file.type,
				size: file.size,
			})
			await throwIfNotOk(created)
			const { data } = safeParseResponse(createUploadResponseSchema, await created.json())
			await uploadToPresignedUrl(data.upload, file)
			const completed = await api.post(`/api/v1/files/${data.file.id}/complete`, {})
			await throwIfNotOk(completed)
			const verified = safeParseResponse(fileResponseSchema, await completed.json()).data
			if (verified.status !== 'ready') throw new Error(REJECTED_MESSAGE)
			return verified
		},
		// A rejected or half-done upload still left a row, so the list refreshes either way.
		onSettled: () => queryClient.invalidateQueries({ queryKey: FILES_KEY }),
		onSuccess: () => toast.success('Archivo subido'),
		onError: (error) => {
			toast.error('No se pudo subir el archivo', { description: fileErrorMessage(error) })
		},
	})
}

export function useDeleteFile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (fileId: string) => {
			const res = await api.delete(`/api/v1/files/${fileId}`)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: FILES_KEY })
			toast.success('Archivo eliminado')
		},
		onError: (error) => {
			toast.error('No se pudo eliminar el archivo', { description: toUserMessage(error) })
		},
	})
}

/** Asks for a short-lived download URL and opens it; the stored attachment header keeps the page. */
export function useDownloadFile() {
	return useMutation({
		// WHY: a mutation, not a query: the URL expires in minutes, so a cached one would fail later.
		mutationFn: async (fileId: string) => {
			const res = await api.get(`/api/v1/files/${fileId}/download`)
			await throwIfNotOk(res)
			const { url } = safeParseResponse(fileDownloadResponseSchema, await res.json()).data
			const downloadUrl = safeUrl(url)
			if (!downloadUrl) throw new Error('Download URL is not a web link')
			globalThis.location.assign(downloadUrl)
		},
		onError: (error) => {
			toast.error('No se pudo descargar el archivo', { description: toUserMessage(error) })
		},
	})
}
