import type { MemberRole } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Plus, Trash2, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import type { ListParams } from '@/hooks/use-query-params'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
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
import { buildMemberColumns } from './member-columns'
import { TeamForm } from './team-form'

export function TeamList() {
	const params = useSearch({ from: '/_authed/settings/team' })
	const navigate = useNavigate()
	const setParams = useCallback(
		(updates: Partial<ListParams>) => {
			void navigate({
				to: '.',
				search: (prev: Record<string, unknown>) => ({ ...prev, ...updates }),
				replace: true,
			})
		},
		[navigate],
	)
	const { data: currentUser } = useCurrentUser()
	const { data, isLoading, isFetching, error } = useTeamMembers(params)
	const inviteMember = useInviteMember()
	const updateRole = useUpdateMemberRole()
	const removeMember = useRemoveMember()
	const bulkRemove = useBulkRemoveMembers()

	const [showInvite, setShowInvite] = useState(false)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showBulkDelete, setShowBulkDelete] = useState(false)
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

	const onRoleChange = useCallback(
		(id: string, role: MemberRole) => updateRole.mutate({ id, role }),
		[updateRole],
	)

	const columns = useMemo(
		() => buildMemberColumns(onRoleChange, (id) => setDeleteId(id), currentUser?.id),
		[onRoleChange, currentUser?.id],
	)

	if (error) {
		return <InlineError message={error.message} onRetry={() => globalThis.location.reload()} />
	}

	const handleBulkDelete = () => {
		bulkRemove.mutate([...selectedIds], {
			onSuccess: () => {
				setSelectedIds(new Set())
				setShowBulkDelete(false)
			},
		})
	}

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Team"
				description="Manage members and their roles in your organization."
				search={
					<SearchInput
						value={params.search}
						onChange={(v) => setParams({ search: v, page: 1 })}
						placeholder="Search members..."
						isLoading={isFetching && !isLoading}
						className="w-full sm:w-64"
					/>
				}
				action={
					<Button onClick={() => setShowInvite(true)} className="w-full sm:w-auto aether-squish">
						<Plus className="mr-1.5 h-4 w-4" />
						Invite Member
					</Button>
				}
			/>

			<div className="rounded-xl border border-border/50 bg-card shadow-sm">
				<DataTable
					data={data?.data ?? []}
					columns={columns}
					getId={(m) => m.id}
					isLoading={isLoading}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					sort={params.sort}
					order={params.order}
					onSortChange={(s, o) => setParams({ sort: s, order: o })}
					emptyMessage="No team members yet."
					emptyIcon={<Users className="h-6 w-6 text-muted-foreground" />}
					emptyAction={
						<Button size="sm" onClick={() => setShowInvite(true)}>
							<Plus className="mr-1.5 h-4 w-4" />
							Invite Member
						</Button>
					}
				/>
			</div>

			{data?.meta && data.meta.total > 0 && (
				<Pagination
					meta={data.meta}
					onPageChange={(p) => setParams({ page: p })}
					onPerPageChange={(l) => setParams({ limit: l, page: 1 })}
					perPageOptions={[10, 15, 25, 50]}
				/>
			)}

			<TeamForm
				open={showInvite}
				onOpenChange={setShowInvite}
				onSubmit={(input) => {
					inviteMember.mutate(
						{ ...input, role: input.role ?? 'user' },
						{ onSuccess: () => setShowInvite(false) },
					)
				}}
				isPending={inviteMember.isPending}
			/>

			<ConfirmDelete
				open={deleteId !== null}
				onOpenChange={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) {
						removeMember.mutate(deleteId)
						setDeleteId(null)
					}
				}}
				title="Remove member?"
				description="This member will lose access to the organization immediately."
				isPending={removeMember.isPending}
			/>

			<ConfirmDelete
				open={showBulkDelete}
				onOpenChange={setShowBulkDelete}
				onConfirm={handleBulkDelete}
				title={`Remove ${selectedIds.size} member${selectedIds.size === 1 ? '' : 's'}?`}
				description={`This will remove ${selectedIds.size} member${selectedIds.size === 1 ? '' : 's'} from the organization.`}
				isPending={bulkRemove.isPending}
			/>

			{/* Floating Bulk Actions Bar */}
			{selectedIds.size > 0 && (
				<div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300">
					<div className="flex items-center gap-2 sm:gap-3 rounded-full border border-border/50 bg-background/95 px-3 sm:px-4 py-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10">
						<span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs font-medium text-primary-foreground">
							{selectedIds.size}
						</span>
						<span className="hidden sm:block border-r border-border/50 pr-2 text-sm font-medium text-foreground">
							Selected
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowBulkDelete(true)}
							className="h-7 sm:h-8 rounded-full px-2 sm:px-3 text-xs sm:text-sm"
						>
							<Trash2 className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
							Remove
						</Button>
					</div>
				</div>
			)}
		</FadeIn>
	)
}
