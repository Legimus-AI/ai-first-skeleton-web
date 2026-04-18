import {
	type ApiKey,
	type ApiKeysResponse,
	apiKeysResponseSchema,
	type CreateApiKey,
	type CreateApiKeyResponse,
	createApiKeyResponseSchema,
} from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk } from '@/services/api-error'

export const apiKeysQueryOptions = queryOptions({
	queryKey: ['auth', 'api-keys'],
	queryFn: async (): Promise<ApiKey[]> => {
		const res = await api.get('/api/v1/auth/api-keys')
		await throwIfNotOk(res)
		const json: unknown = await res.json()
		const parsed: ApiKeysResponse = safeParseResponse(apiKeysResponseSchema, json)
		return parsed.data
	},
})

export function useApiKeys() {
	return useQuery(apiKeysQueryOptions)
}

export function useCreateApiKey() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateApiKey): Promise<CreateApiKeyResponse> => {
			const res = await api.post('/api/v1/auth/api-keys', input)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(createApiKeyResponseSchema, json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys'] })
			toast.success('API key created', {
				description: "Copy your key now — it won't be shown again.",
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to create API key', {
				description: error.message,
			})
		},
	})
}

export function useDeleteApiKey() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (keyId: string) => {
			const res = await api.delete(`/api/v1/auth/api-keys/${keyId}`)
			await throwIfNotOk(res)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auth', 'api-keys'] })
			toast.success('API key revoked', {
				description: 'Applications using this key will lose access immediately.',
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to revoke API key', {
				description: error.message,
			})
		},
	})
}
