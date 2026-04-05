import { createFileRoute } from '@tanstack/react-router'
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { usePushNotifications } from '@/lib/use-push-notifications'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

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

	useEffect(() => {
		if (testPlayed) {
			const timer = setTimeout(() => setTestPlayed(false), 2000)
			return () => clearTimeout(timer)
		}
	}, [testPlayed])

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
				<p className="text-sm text-muted-foreground">
					Configure how and when you receive notifications.
				</p>
			</div>

			{/* Push Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Bell className="h-4 w-4" />
								Push Notifications
							</CardTitle>
							<CardDescription>
								Receive native browser notifications even when the tab is in the background.
							</CardDescription>
						</div>
						<PushStatusBadge permission={push.permission} isSubscribed={push.isSubscribed} />
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{!push.isSupported ? (
						<p className="text-sm text-muted-foreground">
							Your browser does not support push notifications.
						</p>
					) : push.permission === 'denied' ? (
						<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
							<p className="text-sm font-medium text-destructive">Notifications blocked</p>
							<p className="mt-1 text-xs text-muted-foreground">
								You blocked notifications for this site. To enable them, click the lock icon in your
								browser's address bar and allow notifications.
							</p>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-foreground">
									{push.isSubscribed
										? 'Notifications are active on this device'
										: 'Enable notifications on this device'}
								</p>
								<p className="text-xs text-muted-foreground">
									{push.isSubscribed
										? "You'll receive alerts for new messages, leads, and updates."
										: 'Get instant alerts when something important happens.'}
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
										Disable
									</>
								) : (
									<>
										<Bell className="mr-1.5 h-3.5 w-3.5" />
										Enable
									</>
								)}
							</Button>
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
								Sound Notifications
							</CardTitle>
							<CardDescription>
								Play a sound when a new notification arrives in the app.
							</CardDescription>
						</div>
						<Badge variant={sound.enabled ? 'success' : 'secondary'}>
							{sound.enabled ? 'On' : 'Off'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-foreground">
								{sound.enabled ? 'Sound alerts are active' : 'Sound alerts are muted'}
							</p>
							<p className="text-xs text-muted-foreground">
								Applies to in-app notifications like new messages and assignments.
							</p>
						</div>
						<Button
							variant={sound.enabled ? 'outline' : 'primary'}
							size="sm"
							onClick={() => {
								sound.toggle()
								toast.success(sound.enabled ? 'Sound muted' : 'Sound enabled')
							}}
						>
							{sound.enabled ? (
								<>
									<VolumeX className="mr-1.5 h-3.5 w-3.5" />
									Mute
								</>
							) : (
								<>
									<Volume2 className="mr-1.5 h-3.5 w-3.5" />
									Unmute
								</>
							)}
						</Button>
					</div>

					{sound.enabled && (
						<div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
							<Button variant="ghost" size="sm" onClick={playTestSound} disabled={testPlayed}>
								{testPlayed ? 'Played!' : 'Test sound'}
							</Button>
							<span className="text-xs text-muted-foreground">Preview the notification sound.</span>
						</div>
					)}
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
	if (permission === 'denied') return <Badge variant="destructive">Blocked</Badge>
	if (isSubscribed) return <Badge variant="success">Active</Badge>
	return <Badge variant="secondary">Off</Badge>
}
