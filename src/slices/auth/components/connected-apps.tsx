import type { OAuthConnection } from '@repo/shared'
import { useMemo, useState } from 'react'
import { copyToClipboard } from '@/services/clipboard-service'
import { Button } from '@/ui/button'
import { ConfirmDelete } from '@/ui/confirm-delete'
import { DataTable } from '@/ui/data-table'
import { Copy, Monitor } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { useConnections, useRevokeConnection } from '../hooks/use-connections'
import { buildConnectionColumns } from './connection-columns'

/** "Apps conectadas": the MCP clients and CLIs signed in with this account, each one revocable. */
export function ConnectedApps() {
	const { data: connections, isLoading, error, refetch } = useConnections()
	const revoke = useRevokeConnection()
	const [toRevoke, setToRevoke] = useState<OAuthConnection | null>(null)
	const columns = useMemo(() => buildConnectionColumns(setToRevoke), [])

	return (
		<section aria-labelledby="connected-apps-title" className="space-y-4">
			<div className="space-y-1">
				<h2 id="connected-apps-title" className="text-lg font-semibold tracking-tight">
					Apps conectadas
				</h2>
				<p className="text-sm text-muted-foreground">
					Apps y terminales que entraron con tu cuenta, como Claude, tu editor o la CLI. Desconecta
					las que ya no uses.
				</p>
			</div>

			{error ? (
				<InlineError error={error} onRetry={() => void refetch()} />
			) : (
				<div className="rounded-surface bg-card shadow-surface">
					<DataTable
						data={connections ?? []}
						columns={columns}
						getId={(connection) => connection.clientId}
						getRowLabel={(connection) => connection.clientName}
						isLoading={isLoading}
						skeletonRows={2}
						emptyMessage="Ninguna app conectada todavía."
						emptyIcon={<Monitor className="h-6 w-6 text-muted-foreground" />}
						emptyAction={
							<Button
								size="sm"
								variant="outline"
								onClick={() =>
									void copyToClipboard(
										`${globalThis.location.origin}/mcp`,
										'URL del servidor MCP copiada',
									)
								}
							>
								<Copy className="mr-1.5 h-4 w-4" />
								Copiar URL del servidor MCP
							</Button>
						}
					/>
				</div>
			)}

			<ConfirmDelete
				open={toRevoke !== null}
				onOpenChange={() => setToRevoke(null)}
				onConfirm={() => {
					if (toRevoke)
						revoke.mutate(toRevoke.clientId, {
							onSettled: () => setToRevoke(null),
						})
				}}
				title={toRevoke ? `¿Desconectar ${toRevoke.clientName}?` : '¿Desconectar la app?'}
				confirmLabel="Desconectar"
				description="Pierde el acceso a tu cuenta de inmediato. Para volver a usarla tendrás que conectarla otra vez."
				isPending={revoke.isPending}
			/>
		</section>
	)
}
