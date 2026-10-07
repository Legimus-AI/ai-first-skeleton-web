import { grantsPermission, rolePermissions, type TeamMember } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { usePageInRange } from '@/hooks/use-page-in-range'
import type { ListParams } from '@/hooks/use-query-params'
import { useRowSelection } from '@/hooks/use-row-selection'
import { authErrorField, authErrorMessage } from '@/slices/auth/auth-error'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { Plus, Trash, Users } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Pagination } from '@/ui/pagination'
import { SearchInput } from '@/ui/search-input'
import {
	useBulkRemoveMembers,
	useInviteMember,
	useRemoveMember,
	useTeamMembers,
	useUpdateMemberRole,
} from '../hooks/use-team'
import type { AssignableRole } from '../team-form-schema'
import { buildMemberColumns, isManageableMember } from './member-columns'
import { PendingInvitations } from './pending-invitations'
import { TeamForm } from './team-form'

export function TeamList() {
	const { invitationsPage = 1, ...params } = useSearch({ from: '/_authed/settings/team' })
	const navigate = useNavigate()
	const setParams = useCallback(
		(updates: Partial<ListParams & { invitationsPage: number }>) => {
			void navigate({
				to: '.',
				search: (prev: Record<string, unknown>) => ({ ...prev, ...updates }),
				replace: true,
			})
		},
		[navigate],
	)
	const { data: currentUser } = useCurrentUser()
	// Hide what the API would refuse (403): only roles granting team:write manage members.
	const canManage = currentUser
		? grantsPermission(rolePermissions(currentUser.role), 'team:write')
		: false
	const { data, isLoading, isFetching, error, refetch } = useTeamMembers(params)
	const inviteMember = useInviteMember()
	const updateRole = useUpdateMemberRole()
	const removeMember = useRemoveMember()
	const bulkRemove = useBulkRemoveMembers()

	const [showInvite, setShowInvite] = useState(false)
	const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
	const [showBulkDelete, setShowBulkDelete] = useState(false)
	const [selectedIds, setSelectedIds] = useRowSelection(JSON.stringify(params))

	const onRoleChange = useCallback(
		(member: TeamMember, role: AssignableRole) => updateRole.mutate({ member, role }),
		[updateRole],
	)

	const roleChangePendingFor = updateRole.isPending ? updateRole.variables.member.id : undefined
	const columns = useMemo(
		() =>
			buildMemberColumns({
				onRoleChange,
				onDelete: setMemberToRemove,
				canManage,
				currentUserId: currentUser?.id,
				roleChangePendingFor,
			}),
		[onRoleChange, canManage, currentUser?.id, roleChangePendingFor],
	)
	const setPage = useCallback((page: number) => setParams({ page }), [setParams])
	const setInvitationsPage = useCallback(
		(page: number) => setParams({ invitationsPage: page }),
		[setParams],
	)
	const movingToLastPage = usePageInRange(data?.meta, setPage)

	if (error) {
		return <InlineError error={error} onRetry={() => void refetch()} />
	}

	const handleBulkDelete = () => {
		// Better Auth removes a member by email; the selection holds user ids.
		const emailById = new Map(data?.data.map((member) => [member.id, member.email]))
		bulkRemove.mutate(
			[...selectedIds].flatMap((id) => emailById.get(id) ?? []),
			{
				// The list refetches either way; a member that could not be removed shows up again.
				onSettled: () => {
					setSelectedIds(new Set())
					setShowBulkDelete(false)
				},
			},
		)
	}

	const inviteButton = canManage && (
		<Button onClick={() => setShowInvite(true)} className="w-full sm:w-auto">
			<Plus className="mr-1.5 h-4 w-4" />
			Invitar miembro
		</Button>
	)

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Equipo"
				description="Los miembros de tu organización y sus roles."
				search={
					<SearchInput
						value={params.search}
						onChange={(search) => setParams({ search, page: 1 })}
						placeholder="Buscar miembros..."
						isLoading={isFetching && !isLoading}
						className="w-full sm:w-64"
					/>
				}
				action={inviteButton}
			/>

			<div className="rounded-surface bg-card shadow-surface">
				<DataTable
					data={data?.data ?? []}
					columns={columns}
					getId={(member) => member.id}
					getRowLabel={(member) => member.name}
					isLoading={isLoading || movingToLastPage}
					selectedIds={selectedIds}
					{...(canManage && { onSelectionChange: setSelectedIds })}
					canSelect={(member) => isManageableMember(member, currentUser?.id)}
					sort={params.sort}
					order={params.order}
					onSortChange={(sort, order) => setParams({ sort, order })}
					emptyMessage={
						params.search ? `Sin resultados para "${params.search}"` : 'Aún no hay miembros.'
					}
					emptyIcon={<Users className="h-6 w-6 text-muted-foreground" />}
					emptyAction={inviteButton}
				/>
			</div>

			{data?.meta && data.meta.total > 0 && (
				<Pagination
					meta={data.meta}
					onPageChange={(page) => setParams({ page })}
					onPerPageChange={(limit) => setParams({ limit, page: 1 })}
				/>
			)}

			{canManage && (
				<PendingInvitations
					page={invitationsPage}
					onPageChange={setInvitationsPage}
					onInvite={() => setShowInvite(true)}
				/>
			)}

			<TeamForm
				open={showInvite}
				onOpenChange={setShowInvite}
				onSubmit={(input, setError) => {
					inviteMember.mutate(input, {
						onSuccess: () => setShowInvite(false),
						onError: (error) => {
							if (authErrorField(error) === 'email')
								setError('email', { message: authErrorMessage(error) })
						},
					})
				}}
				isPending={inviteMember.isPending}
			/>

			<ConfirmDelete
				open={memberToRemove !== null}
				onOpenChange={() => setMemberToRemove(null)}
				onConfirm={() => {
					if (memberToRemove)
						removeMember.mutate(memberToRemove, {
							onSettled: () => setMemberToRemove(null),
						})
				}}
				title="¿Quitar a este miembro?"
				description="Perderá el acceso a la organización de inmediato."
				confirmLabel="Quitar"
				isPending={removeMember.isPending}
			/>

			<ConfirmDelete
				open={showBulkDelete}
				onOpenChange={setShowBulkDelete}
				onConfirm={handleBulkDelete}
				title={`¿Quitar ${selectedIds.size} miembro${selectedIds.size === 1 ? '' : 's'}?`}
				description="Perderán el acceso a la organización de inmediato."
				confirmLabel="Quitar"
				isPending={bulkRemove.isPending}
			/>

			{/* Floating Bulk Actions Bar */}
			{selectedIds.size > 0 && (
				<div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300">
					<div className="flex items-center gap-2 sm:gap-3 rounded-full bg-popover px-3 sm:px-4 py-2 shadow-overlay">
						<span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-2xs sm:text-xs font-medium text-primary-foreground">
							{selectedIds.size}
						</span>
						<span className="hidden sm:block border-r border-border/50 pr-2 text-sm font-medium text-foreground">
							Seleccionados
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowBulkDelete(true)}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm"
						>
							<Trash className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
							Quitar
						</Button>
					</div>
				</div>
			)}
		</FadeIn>
	)
}
