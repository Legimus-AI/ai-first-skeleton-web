import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/utils/api-client'
import { throwIfNotOk } from '@/utils/api-error'

type PushPermission = NotificationPermission | 'unsupported'

interface UsePushNotifications {
	/** Browser supports push notifications. */
	isSupported: boolean
	/** Current permission state: 'default' | 'granted' | 'denied' | 'unsupported'. */
	permission: PushPermission
	/** Whether the user is currently subscribed to push on this device. */
	isSubscribed: boolean
	/** Request permission and subscribe to push notifications. */
	subscribe: () => Promise<void>
	/** Unsubscribe from push notifications on this device. */
	unsubscribe: () => Promise<void>
	/** Whether a subscribe/unsubscribe operation is in progress. */
	isPending: boolean
}

function isPushSupported(): boolean {
	return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Hook for managing browser push notifications.
 *
 * Usage:
 * ```tsx
 * function NotificationBell() {
 *   const { isSupported, permission, isSubscribed, subscribe, unsubscribe, isPending } = usePushNotifications()
 *
 *   if (!isSupported) return null
 *   if (permission === 'denied') return <p>Notifications blocked</p>
 *
 *   return (
 *     <Button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isPending}>
 *       {isSubscribed ? 'Disable' : 'Enable'} notifications
 *     </Button>
 *   )
 * }
 * ```
 */
export function usePushNotifications(): UsePushNotifications {
	const supported = isPushSupported()
	const [permission, setPermission] = useState<PushPermission>(
		supported ? Notification.permission : 'unsupported',
	)
	const [isSubscribed, setIsSubscribed] = useState(false)
	const [isPending, setIsPending] = useState(false)

	// Register SW and check existing subscription on mount
	useEffect(() => {
		if (!supported) return

		navigator.serviceWorker
			.register('/sw.js')
			.then((reg) => reg.pushManager.getSubscription())
			.then((sub) => setIsSubscribed(sub !== null))
			.catch(() => setIsSubscribed(false))
	}, [supported])

	const subscribe = useCallback(async () => {
		if (!supported || isPending) return
		setIsPending(true)

		try {
			// 1. Get VAPID public key from backend
			const keyRes = await api.get('/api/v1/push/vapid-key')
			await throwIfNotOk(keyRes)
			const { data } = (await keyRes.json()) as { data: { publicKey: string } }

			// 2. Register service worker
			const registration = await navigator.serviceWorker.register('/sw.js')
			await navigator.serviceWorker.ready

			// 3. Request permission + subscribe
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(data.publicKey).buffer as ArrayBuffer,
			})

			setPermission(Notification.permission)

			// 4. Send subscription to backend
			const json = subscription.toJSON()
			const subRes = await api.post('/api/v1/push/subscribe', {
				endpoint: json.endpoint,
				keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
			})
			await throwIfNotOk(subRes)

			setIsSubscribed(true)
			toast.success('Notifications enabled', {
				description: "You'll receive alerts on this device.",
			})
		} catch (err) {
			setPermission(Notification.permission)
			const message = err instanceof Error ? err.message : 'Failed to enable notifications'
			toast.error('Could not enable notifications', { description: message })
		} finally {
			setIsPending(false)
		}
	}, [supported, isPending])

	const unsubscribe = useCallback(async () => {
		if (!supported || isPending) return
		setIsPending(true)

		try {
			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.getSubscription()

			if (subscription) {
				// Remove from backend
				await api.delete('/api/v1/push/subscribe', { endpoint: subscription.endpoint })
				// Unsubscribe browser
				await subscription.unsubscribe()
			}

			setIsSubscribed(false)
			toast.success('Notifications disabled')
		} catch {
			toast.error('Failed to disable notifications')
		} finally {
			setIsPending(false)
		}
	}, [supported, isPending])

	return { isSupported: supported, permission, isSubscribed, subscribe, unsubscribe, isPending }
}

/** Convert a VAPID public key from base64 URL encoding to a Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}
