// @generated-by-ai-first-skeleton — do not remove this line
import {
	type ListQuery,
	type MemberRole,
	type PendingInvitation,
	pendingInvitationListResponseSchema,
	type TeamMember,
	teamListResponseSchema,
} from '@repo/shared'
import {
	keepPreviousData,
	type QueryClient,
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk } from '@/services/api-error'
import {
	cancelInvitation,
	inviteMember,
	leaveOrganization,
	membershipIdOf,
	removeMember,
	updateMemberRole,
} from '@/slices/auth/auth-client'
import { AuthApiError, authErrorMessage } from '@/slices/auth/auth-error'
import { authQueryOptions } from '@/slices/auth/hooks/use-auth'
import type { InviteMemberForm } from '../team-form-schema'

export const TEAM_KEY = ['team'] as const
const INVITATIONS_KEY = [...TEAM_KEY, 'invitations'] as const

/** The member list stays on REST: it pages, searches and sorts like every other list. */
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

/** One page of members, searched and sorted by the server. */
export function useTeamMembers(params?: Partial<ListQuery>) {
	return useQuery(teamQueryOptions(params))
}

// Writes are Better Auth's organization endpoints: a session only, and the last owner is protected.

/** The signed-in user's organization, which every organization call names. */
async function organizationIdOf(queryClient: QueryClient): Promise<string> {
	const user = await queryClient.ensureQueryData(authQueryOptions)
	if (!user) throw new Error('Team changes need a signed-in user')
	return user.organizationId
}

/** Emails an invitation; the person joins at /accept-invitation. */
export function useInviteMember() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (input: InviteMemberForm) =>
			inviteMember({ ...input, organizationId: await organizationIdOf(queryClient) }),
		onSuccess: (_data, { email }) => {
			void queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY })
			toast.success('Invitación enviada', {
				description: `${email} recibirá un enlace para unirse al equipo.`,
			})
		},
		onError: (error) => toast.error('No se pudo invitar', { description: authErrorMessage(error) }),
	})
}

/** Changes a member's role; `owner` hands ownership over (only an owner may), and the last owner stays. */
export function useUpdateMemberRole() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ member, role }: { member: TeamMember; role: MemberRole }) => {
			const organizationId = await organizationIdOf(queryClient)
			// WHY: Better Auth changes a role by membership id; the team list is keyed by user id.
			const memberId = await membershipIdOf({ organizationId, userId: member.id })
			if (!memberId) {
				throw new AuthApiError('Member not found', 'MEMBER_NOT_FOUND', { status: 404 })
			}
			await updateMemberRole({ memberId, role, organizationId })
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.success('Rol actualizado')
		},
		onError: (error) => {
			void queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.error('No se pudo cambiar el rol', { description: authErrorMessage(error) })
		},
	})
}

/** Leaves the organization (never the last owner); the API ends the leaver's sessions. */
export function useLeaveOrganization() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: async () => leaveOrganization(await organizationIdOf(queryClient)),
		onSuccess: () => {
			// WHY: the leave ended every session of the account; the next sign-in lands in the new personal organization.
			queryClient.clear()
			void navigate({ to: '/login', search: { redirect: undefined } })
			toast.success('Saliste de la organización', {
				description: 'Inicia sesión de nuevo: te esperará una organización personal nueva.',
			})
		},
		onError: (error) =>
			toast.error('No pudimos sacarte de la organización', {
				description: authErrorMessage(error),
			}),
	})
}

/** Removes one member; Better Auth refuses to remove the last owner. */
export function useRemoveMember() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (member: TeamMember) =>
			removeMember({ email: member.email, organizationId: await organizationIdOf(queryClient) }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: TEAM_KEY })
			toast.success('Miembro quitado del equipo')
		},
		onError: (error) =>
			toast.error('No se pudo quitar al miembro', { description: authErrorMessage(error) }),
	})
}

/** Removes several members, one call each (Better Auth has no bulk remove); counts the failures. */
export function useBulkRemoveMembers() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (emails: string[]) => {
			const organizationId = await organizationIdOf(queryClient)
			const results = await Promise.allSettled(
				emails.map((email) => removeMember({ email, organizationId })),
			)
			const failures = results.filter(
				(result): result is PromiseRejectedResult => result.status === 'rejected',
			)
			const [firstFailure] = failures
			if (firstFailure) {
				const members = `${emails.length} miembro${emails.length === 1 ? '' : 's'}`
				throw new Error(`No se pudo quitar a ${failures.length} de ${members}`, {
					cause: firstFailure.reason,
				})
			}
		},
		onSuccess: (_data, emails) => {
			toast.success(
				`${emails.length} miembro${emails.length === 1 ? '' : 's'} quitado${emails.length === 1 ? '' : 's'} del equipo`,
			)
		},
		// The title counts the failures; the first one's reason says why.
		onError: (error) => toast.error(error.message, { description: authErrorMessage(error.cause) }),
		onSettled: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
	})
}

/** One page of the invitations nobody has answered yet, newest first (the team API's order). */
export const invitationsQueryOptions = (params?: Partial<ListQuery>) =>
	queryOptions({
		queryKey: [...INVITATIONS_KEY, params],
		queryFn: async ({ signal }) => {
			const res = await api.get('/api/v1/team/invitations', params, signal)
			await throwIfNotOk(res)
			const json: unknown = await res.json()
			return safeParseResponse(pendingInvitationListResponseSchema, json)
		},
		placeholderData: keepPreviousData,
	})

export function usePendingInvitations(params?: Partial<ListQuery>) {
	return useQuery(invitationsQueryOptions(params))
}

/** Cancels an invitation: the link in its email stops working. */
export function useCancelInvitation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: cancelInvitation,
		onSuccess: () => {
			toast.success('Invitación anulada')
		},
		onError: (error) => {
			toast.error('No se pudo anular la invitación', { description: authErrorMessage(error) })
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY }),
	})
}

/** Emails a pending invitation again, with a fresh deadline; an expired one is replaced by a new row. */
export function useResendInvitation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, email, role, expiresAt }: PendingInvitation) => {
			// WHY: Better Auth's resend only refreshes a live invitation; on an expired one it would add a duplicate row.
			const isExpired = Date.parse(expiresAt) <= Date.now()
			if (isExpired) await cancelInvitation(id)
			await inviteMember({
				email,
				role,
				organizationId: await organizationIdOf(queryClient),
				resend: !isExpired,
			})
		},
		onSuccess: (_data, { email }) => {
			toast.success('Invitación reenviada', { description: `${email} recibirá un enlace nuevo.` })
		},
		onError: (error) => {
			toast.error('No se pudo reenviar la invitación', { description: authErrorMessage(error) })
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY }),
	})
}
