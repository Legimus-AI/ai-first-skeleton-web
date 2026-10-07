import { PublicLayout } from '@/layouts/public-layout'
import { Button } from '@/ui/button'
import { InlineError } from '@/ui/inline-error'
import { Skeleton } from '@/ui/skeleton'
import { authErrorMessage } from '../auth-error'
import {
	DEVICE_ERROR_MESSAGES,
	useDecideDeviceRequest,
	useDeviceRequest,
	useOAuthClient,
} from '../hooks/use-oauth'
import { scopesOf } from '../oauth-request'
import { OAuthScopes } from './oauth-scopes'
import { SignedInAsNotice } from './signed-in-as-notice'

interface DeviceApprovalPageProps {
	userCode: string
	/** Clears the code from the URL so another one can be typed. */
	onChangeCode: () => void
}

/** A CLI login (`pnpm agent login`) waits for the signed-in person to approve or deny it. */
export function DeviceApprovalPage({ userCode, onChangeCode }: DeviceApprovalPageProps) {
	const deviceRequest = useDeviceRequest(userCode)
	const oauthClient = useOAuthClient(deviceRequest.data?.clientId)
	const decision = useDecideDeviceRequest(userCode)

	const typeAnotherCode = (
		<Button type="button" variant="outline" className="w-full" onClick={onChangeCode}>
			Escribir otro código
		</Button>
	)

	if (deviceRequest.isPending) {
		return (
			<PublicLayout title="Conecta tu terminal" description="Buscamos tu código.">
				<Skeleton className="h-24 w-full" />
			</PublicLayout>
		)
	}
	if (deviceRequest.isError) {
		return (
			<PublicLayout
				title="No pudimos usar ese código"
				description={userCode}
				footer={typeAnotherCode}
			>
				<InlineError
					error={deviceRequest.error}
					message={authErrorMessage(deviceRequest.error, DEVICE_ERROR_MESSAGES)}
					onRetry={() => void deviceRequest.refetch()}
				/>
			</PublicLayout>
		)
	}
	if (decision.isSuccess) {
		return (
			<PublicLayout
				title={decision.variables ? 'Listo' : 'Acceso rechazado'}
				description={
					decision.variables
						? 'Vuelve a tu terminal: ya puede usar tu cuenta.'
						: 'Tu terminal no podrá entrar con este código.'
				}
			>
				<p className="text-sm text-muted-foreground">Ya puedes cerrar esta pestaña.</p>
			</PublicLayout>
		)
	}

	const { status, clientId, scope } = deviceRequest.data
	// Better Auth shows the client and scopes only to the account that opened the code first.
	if (status !== 'pending' || !clientId) {
		return (
			<PublicLayout title="Este código ya se usó" description={userCode} footer={typeAnotherCode}>
				<p role="alert" className="text-sm text-muted-foreground">
					{status === 'pending'
						? 'Otra cuenta abrió este código. Vuelve a iniciar sesión desde tu terminal.'
						: 'Si necesitas entrar de nuevo, vuelve a iniciar sesión desde tu terminal.'}
				</p>
			</PublicLayout>
		)
	}

	const appName = oauthClient.data?.name ?? (oauthClient.isLoading ? undefined : clientId)

	return (
		<PublicLayout
			title={appName ? `Conectar ${appName}` : 'Conecta tu terminal'}
			description="Tu terminal quiere usar tu cuenta."
			onSubmit={() => decision.mutate(true)}
			footer={
				<>
					<Button
						type="submit"
						className="w-full"
						loading={decision.isPending && decision.variables}
						disabled={decision.isPending}
					>
						Aprobar
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						loading={decision.isPending && !decision.variables}
						disabled={decision.isPending}
						onClick={() => decision.mutate(false)}
					>
						Rechazar
					</Button>
				</>
			}
		>
			<p className="text-sm text-muted-foreground">
				Confirma que tu terminal muestra este código:{' '}
				<span className="font-mono font-medium tracking-widest text-foreground">{userCode}</span>
			</p>
			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">Podrá:</p>
				<OAuthScopes scopes={scopesOf(scope)} />
			</div>
			<SignedInAsNotice />
		</PublicLayout>
	)
}
