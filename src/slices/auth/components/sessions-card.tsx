import { useMemo } from 'react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { DataTable } from '@/ui/data-table'
import { Monitor } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { authErrorMessage } from '../auth-error'
import { useRevokeOtherSessions, useRevokeSession, useSessions } from '../hooks/use-account'
import { buildSessionColumns } from './session-columns'

/** "Sesiones": where the account is signed in, each one closable, or all but this one at once. */
export function SessionsCard() {
	const { data: sessions, isLoading, error, refetch } = useSessions()
	const revokeSession = useRevokeSession()
	const revokeOtherSessions = useRevokeOtherSessions()
	const columns = useMemo(
		() => buildSessionColumns((session) => revokeSession.mutate(session.token)),
		[revokeSession.mutate],
	)
	const hasOtherSessions = sessions?.some((session) => !session.isCurrent) ?? false

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sesiones</CardTitle>
				<CardDescription>
					Los dispositivos donde tu cuenta tiene la sesión abierta. Cierra los que no reconozcas.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error ? (
					<InlineError
						error={error}
						message={authErrorMessage(error)}
						onRetry={() => void refetch()}
					/>
				) : (
					<DataTable
						data={sessions ?? []}
						columns={columns}
						getId={(session) => session.token}
						getRowLabel={(session) => session.userAgent ?? 'Dispositivo desconocido'}
						isLoading={isLoading}
						skeletonRows={2}
						emptyMessage="No hay sesiones abiertas."
						emptyIcon={<Monitor className="h-6 w-6 text-muted-foreground" />}
					/>
				)}
				<Button
					type="button"
					variant="outline"
					disabled={!hasOtherSessions || revokeSession.isPending}
					loading={revokeOtherSessions.isPending}
					onClick={() => revokeOtherSessions.mutate()}
				>
					Cerrar las otras sesiones
				</Button>
			</CardContent>
		</Card>
	)
}
