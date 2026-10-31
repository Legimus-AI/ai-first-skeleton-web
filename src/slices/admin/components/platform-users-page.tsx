import { Navigate, useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { HOME_PATH } from '@/constants/routes'
import { usePageInRange } from '@/hooks/use-page-in-range'
import type { PlatformUserView } from '@/slices/auth/auth-client'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { Users } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Pagination } from '@/ui/pagination'
import { usePlatformUsers, useSetUserBanned } from '../hooks/use-platform-users'
import { buildPlatformUserColumns } from './platform-user-columns'

/** "Administración": every user of the platform, with ban and unban (platform admins only). */
export function PlatformUsersPage() {
	const { data: currentUser } = useCurrentUser()
	const { page, limit } = useSearch({ from: '/_authed/admin' })
	const navigate = useNavigate()
	const setParams = (updates: { page?: number; limit?: number }) =>
		void navigate({ to: '.', search: (prev) => ({ ...prev, ...updates }), replace: true })
	const { data, isLoading, error, refetch } = usePlatformUsers({ page, limit })
	const setUserBanned = useSetUserBanned()
	const [userToBan, setUserToBan] = useState<PlatformUserView | null>(null)
	const columns = useMemo(
		() =>
			buildPlatformUserColumns({
				onBan: setUserToBan,
				onUnban: (user) => setUserBanned.mutate({ userId: user.id, banned: false }),
				currentUserId: currentUser?.id,
			}),
		[currentUser?.id, setUserBanned.mutate],
	)
	const movingToLastPage = usePageInRange(data?.meta, (lastPage) => setParams({ page: lastPage }))

	// Cosmetic: the API refuses everyone else (403) whatever this page shows.
	if (currentUser && !currentUser.isPlatformAdmin) return <Navigate to={HOME_PATH} replace />
	if (error) return <InlineError error={error} onRetry={() => void refetch()} />

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Administración"
				description="Todos los usuarios de la plataforma. Bloquear a alguien cierra sus sesiones."
			/>
			<div className="rounded-surface bg-card shadow-surface">
				<DataTable
					data={data?.users ?? []}
					columns={columns}
					getId={(user) => user.id}
					getRowLabel={(user) => user.name}
					isLoading={isLoading || movingToLastPage}
					emptyMessage="Aún no hay usuarios."
					emptyIcon={<Users className="h-6 w-6 text-muted-foreground" />}
				/>
			</div>
			{data?.meta && data.meta.total > 0 && (
				<Pagination
					meta={data.meta}
					onPageChange={(nextPage) => setParams({ page: nextPage })}
					onPerPageChange={(nextLimit) => setParams({ limit: nextLimit, page: 1 })}
				/>
			)}

			<ConfirmDelete
				open={userToBan !== null}
				onOpenChange={() => setUserToBan(null)}
				onConfirm={() => {
					if (userToBan)
						setUserBanned.mutate(
							{ userId: userToBan.id, banned: true },
							{ onSettled: () => setUserToBan(null) },
						)
				}}
				title={userToBan ? `¿Bloquear a ${userToBan.name}?` : '¿Bloquear al usuario?'}
				description="Sus sesiones se cierran y no podrá iniciar sesión hasta que lo desbloquees."
				confirmLabel="Bloquear"
				isPending={setUserBanned.isPending}
			/>
		</FadeIn>
	)
}
