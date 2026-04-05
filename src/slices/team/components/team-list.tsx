// @generated-by-ai-first-skeleton — do not remove this line
import type { Team } from '@repo/shared'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ListParams } from '@/lib/use-query-params'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { type Column, DataTable } from '@/ui/data-table'
import { FadeIn } from '@/ui/fade-in'
import { Pagination } from '@/ui/pagination'
import { SearchInput } from '@/ui/search-input'
import {
	useBulkDeleteTeam,
	useCreateTeam,
	useDeleteTeam,
	useTeam,
	useUpdateTeam,
} from '../hooks/use-team'
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
	const [showCreate, setShowCreate] = useState(false)
	const [editTarget, setEditTarget] = useState<Team | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showBulkDelete, setShowBulkDelete] = useState(false)
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

	const { data, isLoading, isFetching, error } = useTeam(params)
	const createTeam = useCreateTeam()
	const updateTeam = useUpdateTeam()
	const deleteTeam = useDeleteTeam()
	const bulkDelete = useBulkDeleteTeam()

	if (error) {
		return <p className="py-8 text-center text-destructive">Error: {error.message}</p>
	}

	const handleBulkDelete = () => {
		bulkDelete.mutate([...selectedIds], {
			onSuccess: () => {
				setSelectedIds(new Set())
				setShowBulkDelete(false)
			},
		})
	}

	const columns: Column<Team>[] = [
		{
			key: 'id',
			label: 'ID',
			sortable: true,
			render: (item) => (
				<span className="font-mono text-[11px] text-muted-foreground">{item.id.slice(0, 8)}</span>
			),
		},
		{
			key: 'createdAt',
			label: 'Creado',
			sortable: true,
			className: 'hidden w-36 lg:table-cell',
			render: (item) => (
				<span className="font-mono text-[11px] tabular-nums text-muted-foreground">
					{new Date(item.createdAt).toLocaleDateString()}
				</span>
			),
		},
		{
			key: 'actions',
			label: '',
			className: 'w-16 text-right',
			render: (item) => (
				<div className="flex justify-end gap-0.5">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setEditTarget(item)
						}}
						aria-label="Editar"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setDeleteId(item.id)
						}}
						aria-label="Eliminar"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	]

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Team"
				description="Gestiona tus team."
				search={
					<SearchInput
						value={params.search}
						onChange={(v) => setParams({ search: v, page: 1 })}
						placeholder="Buscar team..."
						isLoading={isFetching && !isLoading}
						className="w-full sm:w-64"
					/>
				}
				action={
					<Button onClick={() => setShowCreate(true)} className="aether-squish">
						Nueva Team
					</Button>
				}
			/>

			<div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
				<DataTable
					data={data?.data ?? []}
					columns={columns}
					getId={(team) => team.id}
					isLoading={isLoading}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					sort={params.sort}
					order={params.order}
					onSortChange={(s, o) => setParams({ sort: s, order: o })}
					emptyMessage="Sin team aún. ¡Crea el primero!"
					emptyAction={
						<Button size="sm" onClick={() => setShowCreate(true)} className="aether-squish">
							Nueva Team
						</Button>
					}
				/>
			</div>

			<Pagination
				meta={data?.meta}
				onPageChange={(p) => setParams({ page: p })}
				onPerPageChange={(l) => setParams({ limit: l, page: 1 })}
				perPageOptions={[10, 15, 25, 50]}
			/>

			<TeamForm
				open={showCreate}
				onOpenChange={setShowCreate}
				title="Nueva Team"
				submitLabel="Crear"
				defaultValues={undefined}
				onSubmit={(input) => {
					createTeam.mutate(input, { onSuccess: () => setShowCreate(false) })
				}}
				isPending={createTeam.isPending}
			/>

			<TeamForm
				open={editTarget !== null}
				onOpenChange={() => setEditTarget(null)}
				title="Editar Team"
				submitLabel="Guardar"
				defaultValues={editTarget ? {} : undefined}
				onSubmit={(input) => {
					if (!editTarget) return
					updateTeam.mutate(
						{ id: editTarget.id, ...input },
						{ onSuccess: () => setEditTarget(null) },
					)
				}}
				isPending={updateTeam.isPending}
			/>

			<ConfirmDelete
				open={deleteId !== null}
				onOpenChange={() => setDeleteId(null)}
				onConfirm={() => {
					if (deleteId) {
						deleteTeam.mutate(deleteId)
						setDeleteId(null)
					}
				}}
				title="¿Eliminar team?"
				isPending={deleteTeam.isPending}
			/>

			<ConfirmDelete
				open={showBulkDelete}
				onOpenChange={setShowBulkDelete}
				onConfirm={handleBulkDelete}
				title={`¿Eliminar ${selectedIds.size} team${selectedIds.size === 1 ? '' : 's'}?`}
				description={`Se eliminarán permanentemente ${selectedIds.size} elemento${selectedIds.size === 1 ? '' : 's'}. Esta acción no se puede deshacer.`}
				isPending={bulkDelete.isPending}
			/>

			{/* Floating Bulk Actions Bar */}
			{selectedIds.size > 0 && (
				<div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300">
					<div className="flex items-center gap-3 rounded-full border border-border/50 bg-background/80 px-4 py-2.5 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
							{selectedIds.size}
						</span>
						<span className="border-r border-border/50 pr-2 text-sm font-medium text-foreground">
							Seleccionadas
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedIds(new Set())}
							className="h-8 rounded-full px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowBulkDelete(true)}
							className="h-8 rounded-full px-3"
						>
							<Trash2 className="mr-1.5 h-3.5 w-3.5" />
							Eliminar
						</Button>
					</div>
				</div>
			)}
		</FadeIn>
	)
}
