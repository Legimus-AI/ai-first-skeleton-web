import { type OAuthConnection, oauthConnectionsResponseSchema } from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

const CONNECTIONS_KEY = ['auth', 'connections'] as const

/** The apps (MCP clients, the CLI) the user let in with OAuth. */
export const connectionsQueryOptions = queryOptions({
	queryKey: CONNECTIONS_KEY,
	queryFn: async ({ signal }): Promise<OAuthConnection[]> => {
		const connectionsResponse = await api.get('/api/v1/auth/connections', undefined, signal)
		await throwIfNotOk(connectionsResponse)
		const json: unknown = await connectionsResponse.json()
		return safeParseResponse(oauthConnectionsResponseSchema, json).data
	},
})

/** The apps signed in with this account through OAuth, in the server's order. */
export function useConnections() {
	return useQuery(connectionsQueryOptions)
}

/** Ends an app's access at once: its tokens and consent go, so its next call is refused. */
export function useRevokeConnection() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (clientId: string) => {
			// A client id can be a URL (a client metadata document), so it travels encoded.
			const revokeResponse = await api.delete(
				`/api/v1/auth/connections/${encodeURIComponent(clientId)}`,
			)
			await throwIfNotOk(revokeResponse)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY })
			toast.success('App desconectada', { description: 'Ya no puede usar tu cuenta.' })
		},
		onError: (error) => {
			toast.error('No se pudo desconectar la app', { description: toUserMessage(error) })
		},
	})
}
