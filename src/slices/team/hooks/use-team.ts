// @generated-by-ai-first-skeleton — do not remove this line
import {
	type InviteMember,
	type ListQuery,
	teamListResponseSchema,
	teamMemberResponseSchema,
	type UpdateMemberRole,
} from '@repo/shared'
import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useBulkDelete } from '@/hooks/use-bulk-delete'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'

export const TEAM_KEY = ['team'] as const

export const teamQueryOptions = (params?: Partial<ListQuery>) =>
	queryOptions({
		queryKey: [...TEAM_KEY, params],
		queryFn: async ({ signal }) => {
			const res = await api.get('/api/v1/team', params, signal)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(teamListResponseSchema, json)
		},
		placeholderData: keepPreviousData,
	})

export function useTeamMembers(params?: Partial<ListQuery>) {
	return useQuery(teamQueryOptions(params))
}

export function useInviteMember() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: InviteMember) => {
			const res = await api.post('/api/v1/team', input)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(teamMemberResponseSchema, json)
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.success('Invitación enviada', {
				description: `${variables.email} recibirá un enlace para crear su contraseña.`,
			})
		},
		onError: (error) => toast.error('No se pudo invitar', { description: toUserMessage(error) }),
	})
}

export function useUpdateMemberRole() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, ...input }: UpdateMemberRole & { id: string }) => {
			const res = await api.patch(`/api/v1/team/${id}`, input)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(teamMemberResponseSchema, json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.success('Rol actualizado')
		},
		onError: (error) =>
			toast.error('No se pudo cambiar el rol', {
				description: toUserMessage(error),
			}),
	})
}

export function useRemoveMember() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.delete(`/api/v1/team/${id}`)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(teamMemberResponseSchema, json)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.success('Miembro quitado del equipo')
		},
		onError: (error) =>
			toast.error('No se pudo quitar al miembro', {
				description: toUserMessage(error),
			}),
	})
}

export const useBulkRemoveMembers = () => useBulkDelete('/api/v1/team', [...TEAM_KEY])
