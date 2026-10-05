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
import { safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

/** What a new key may do. `*:action` never covers team, API keys, webhooks, audit or approvals. */
export const API_KEY_SCOPE_PRESETS = [
	{
		id: 'read',
		label: 'Solo lectura',
		description: 'Puede leer tus datos; no crea, cambia ni borra nada.',
		scopes: ['*:read'],
	},
	{
		id: 'read-write',
		label: 'Lectura y escritura',
		description:
			'Puede leer, crear y cambiar datos; para borrar pide tu aprobación. No gestiona el equipo ni otras claves.',
		scopes: ['*:read', '*:write'],
	},
	{
		id: 'full',
		label: 'Acceso total',
		description: 'Puede hacer todo lo que tú puedes, incluido gestionar el equipo y las claves.',
		scopes: ['full'],
	},
] as const

export type ApiKeyScopePresetId = (typeof API_KEY_SCOPE_PRESETS)[number]['id']

/** The preset name for a key's scopes, or the raw scopes when they match none (keys made via API). */
export function describeScopes(scopes: readonly string[]): string {
	const preset = API_KEY_SCOPE_PRESETS.find(
		(p) => p.scopes.length === scopes.length && p.scopes.every((s) => scopes.includes(s)),
	)
	return preset?.label ?? scopes.join(', ')
}

export const apiKeysQueryOptions = queryOptions({
	queryKey: ['auth', 'api-keys'],
	queryFn: async ({ signal }): Promise<ApiKey[]> => {
		const res = await api.get('/api/v1/auth/api-keys', undefined, signal)
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
			toast.success('Clave API creada', {
				description: 'Cópiala ahora: no se volverá a mostrar.',
			})
		},
		onError: (error) => {
			toast.error('No se pudo crear la clave', {
				description: toUserMessage(error),
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
			toast.success('Clave API revocada', {
				description: 'Las aplicaciones que la usaban ya no tienen acceso.',
			})
		},
		onError: (error) => {
			toast.error('No se pudo revocar la clave', {
				description: toUserMessage(error),
			})
		},
	})
}
