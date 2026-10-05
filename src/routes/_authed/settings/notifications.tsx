import { createFileRoute } from '@tanstack/react-router'
import { Bell, BellOff, Send, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Hint } from '@/ui/hint'
import { InfoTooltip } from '@/ui/info-tooltip'
import { isMac } from '@/utils/platform'

export const Route = createFileRoute('/_authed/settings/notifications')({
	component: SettingsNotificationsPage,
})

const SOUND_KEY = 'notification-sound-enabled'

function useSoundNotifications() {
	const [enabled, setEnabled] = useState(() => {
		if (typeof window === 'undefined') return true
		return localStorage.getItem(SOUND_KEY) !== 'false'
	})

	const toggle = useCallback(() => {
		setEnabled((prev) => {
			const next = !prev
			localStorage.setItem(SOUND_KEY, String(next))
			return next
		})
	}, [])

	return { enabled, toggle }
}

function SettingsNotificationsPage() {
	const push = usePushNotifications()
	const sound = useSoundNotifications()
	const [testPlayed, setTestPlayed] = useState(false)
	const [pushTestSent, setPushTestSent] = useState(false)

	const playTestSound = useCallback(() => {
		const ctx = new AudioContext()
		const osc = ctx.createOscillator()
		const gain = ctx.createGain()
		osc.connect(gain)
		gain.connect(ctx.destination)
		osc.frequency.value = 880
		gain.gain.value = 0.1
		osc.start()
		osc.stop(ctx.currentTime + 0.15)
		setTestPlayed(true)
	}, [])

	const sendTestPush = useCallback(async () => {
		try {
			// Ensure permission is granted
			const perm = Notification.permission
			if (perm !== 'granted') {
				const result = await Notification.requestPermission()
				if (result !== 'granted') {
					toast.error('No diste permiso para mostrar notificaciones')
					return
				}
			}

			const reg = await navigator.serviceWorker.ready
			await reg.showNotification('Notificación de prueba', {
				body: '¡Las notificaciones push funcionan!',
				icon: '/favicon.ico',
				tag: 'test-notification',
			})
			setPushTestSent(true)
			toast.success('Notificación enviada', {
				description:
					'Revisa el centro de notificaciones de tu sistema. Si no aparece nada, permite las notificaciones de tu navegador en la configuración del sistema.',
			})
		} catch {
			toast.error('No pudimos enviar la notificación de prueba', {
				description: 'Revisa que tu navegador tenga permiso para mostrar notificaciones.',
			})
		}
	}, [])

	useEffect(() => {
		if (testPlayed) {
			const timer = setTimeout(() => setTestPlayed(false), 2000)
			return () => clearTimeout(timer)
		}
	}, [testPlayed])

	useEffect(() => {
		if (pushTestSent) {
			const timer = setTimeout(() => setPushTestSent(false), 3000)
			return () => clearTimeout(timer)
		}
	}, [pushTestSent])

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
				<p className="text-sm text-muted-foreground">Elige cómo y cuándo recibir avisos.</p>
			</div>

			{/* Push Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Bell className="h-4 w-4" />
								Notificaciones push
								<InfoTooltip content="Notificaciones del navegador que aparecen aunque la pestaña esté minimizada o en segundo plano. Funcionan en Chrome, Firefox, Edge y Safari 16.4+." />
							</CardTitle>
							<CardDescription>
								Recibe avisos del navegador aunque la pestaña esté en segundo plano.
							</CardDescription>
						</div>
						<PushStatusBadge permission={push.permission} isSubscribed={push.isSubscribed} />
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{!push.isSupported ? (
						<p className="text-sm text-muted-foreground">
							Tu navegador no admite notificaciones push.
						</p>
					) : push.permission === 'denied' ? (
						<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
							<p className="text-sm font-medium text-destructive">Notificaciones bloqueadas</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Bloqueaste las notificaciones de este sitio. Para activarlas, haz clic en el candado
								de la barra de direcciones y permite las notificaciones.
							</p>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-foreground">
									{push.isSubscribed
										? 'Las notificaciones están activas en este dispositivo'
										: 'Activa las notificaciones en este dispositivo'}
								</p>
								<p className="text-xs text-muted-foreground">
									{push.isSubscribed
										? 'Recibirás avisos cuando pase algo importante.'
										: 'Entérate al instante cuando pase algo importante.'}
								</p>
							</div>
							<Button
								variant={push.isSubscribed ? 'outline' : 'primary'}
								size="sm"
								onClick={push.isSubscribed ? push.unsubscribe : push.subscribe}
								disabled={push.isPending}
							>
								{push.isPending ? (
									'...'
								) : push.isSubscribed ? (
									<>
										<BellOff className="mr-1.5 h-3.5 w-3.5" />
										Desactivar
									</>
								) : (
									<>
										<Bell className="mr-1.5 h-3.5 w-3.5" />
										Activar
									</>
								)}
							</Button>
						</div>
					)}

					{push.isSubscribed && (
						<div className="space-y-3">
							<div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
								<Button variant="ghost" size="sm" onClick={sendTestPush} disabled={pushTestSent}>
									<Send className="mr-1.5 h-3.5 w-3.5" />
									{pushTestSent ? '¡Enviada!' : 'Enviar notificación de prueba'}
								</Button>
								<span className="text-xs text-muted-foreground">
									Comprueba que funcionan en este dispositivo.
								</span>
							</div>
							{isMac() && (
								<Hint variant="tip">
									<strong>macOS:</strong> si no aparece ninguna notificación, ve a{' '}
									<span className="font-medium text-foreground">
										Configuración del Sistema → Notificaciones → Google Chrome
									</span>{' '}
									y activa &quot;Permitir notificaciones&quot; con estilo Tiras o Alertas.
								</Hint>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sound Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								{sound.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
								Sonido
								<InfoTooltip content="Reproduce un sonido dentro de la app cuando llega un aviso nuevo. No afecta a las notificaciones push." />
							</CardTitle>
							<CardDescription>
								Suena un aviso cuando llega una notificación dentro de la app.
							</CardDescription>
						</div>
						<Badge variant={sound.enabled ? 'success' : 'secondary'}>
							{sound.enabled ? 'Activado' : 'Desactivado'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-foreground">
								{sound.enabled ? 'El sonido está activado' : 'El sonido está silenciado'}
							</p>
							<p className="text-xs text-muted-foreground">
								Aplica a los avisos dentro de la app, como mensajes nuevos y asignaciones.
							</p>
						</div>
						<Button
							variant={sound.enabled ? 'outline' : 'primary'}
							size="sm"
							onClick={() => {
								sound.toggle()
								toast.success(sound.enabled ? 'Sonido silenciado' : 'Sonido activado')
							}}
						>
							{sound.enabled ? (
								<>
									<VolumeX className="mr-1.5 h-3.5 w-3.5" />
									Silenciar
								</>
							) : (
								<>
									<Volume2 className="mr-1.5 h-3.5 w-3.5" />
									Activar sonido
								</>
							)}
						</Button>
					</div>

					<div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
						<Button variant="ghost" size="sm" onClick={playTestSound} disabled={testPlayed}>
							<Volume2 className="mr-1.5 h-3.5 w-3.5" />
							{testPlayed ? '¡Listo!' : 'Probar sonido'}
						</Button>
						<span className="text-xs text-muted-foreground">Escucha cómo suena el aviso.</span>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function PushStatusBadge({
	permission,
	isSubscribed,
}: {
	permission: string
	isSubscribed: boolean
}) {
	if (permission === 'denied') return <Badge variant="destructive">Bloqueadas</Badge>
	if (isSubscribed) return <Badge variant="success">Activas</Badge>
	return <Badge variant="secondary">Desactivadas</Badge>
}
