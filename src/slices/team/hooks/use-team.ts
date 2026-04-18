// @generated-by-ai-first-skeleton — do not remove this line
import {
	type InviteMember,
	type ListQuery,
	teamListResponseSchema,
	teamMemberResponseSchema,
	type UpdateMemberRole,
} from '@repo/shared'
import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/utils/api-client'
import { safeParseResponse, throwIfNotOk } from '@/utils/api-error'
import { useBulkDelete } from '@/utils/use-bulk-delete'

export const TEAM_KEY = ['team'] as const

export const teamQueryOptions = (params?: Partial<ListQuery>) =>
	queryOptions({
		queryKey: [...TEAM_KEY, params],
		queryFn: async () => {
			const res = await api.get('/api/v1/team', params)
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
			toast.success('Member invited', {
				description: `${variables.email} has been added to the team.`,
			})
		},
		onError: (error: Error) => toast.error(error.message || 'Failed to invite member'),
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
			toast.success('Role updated')
		},
		onError: (error: Error) => toast.error(error.message || 'Failed to update role'),
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
			toast.success('Member removed')
		},
		onError: (error: Error) => toast.error(error.message || 'Failed to remove member'),
	})
}

export const useBulkRemoveMembers = () => useBulkDelete('/api/v1/team', [...TEAM_KEY])
