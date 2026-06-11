import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/services/api-client'
import { throwIfNotOk } from '@/services/api-error'

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

const SUBSCRIPTION_KEY = ['push', 'subscription'] as const

/** Registers the service worker and reads the current browser push subscription. */
async function readSubscription(): Promise<boolean> {
	const registration = await navigator.serviceWorker.register('/sw.js')
	const subscription = await registration.pushManager.getSubscription()
	return subscription !== null
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
	const queryClient = useQueryClient()
	const [permission, setPermission] = useState<PushPermission>(
		supported ? Notification.permission : 'unsupported',
	)

	const subscriptionQuery = useQuery({
		queryKey: SUBSCRIPTION_KEY,
		queryFn: readSubscription,
		enabled: supported,
		staleTime: Number.POSITIVE_INFINITY,
	})

	const subscribeMutation = useMutation({
		mutationFn: async () => {
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

			// 4. Send subscription to backend
			const json = subscription.toJSON()
			const subRes = await api.post('/api/v1/push/subscribe', {
				endpoint: json.endpoint,
				keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
			})
			await throwIfNotOk(subRes)
		},
		onSettled: () => setPermission(Notification.permission),
		onSuccess: () => {
			queryClient.setQueryData(SUBSCRIPTION_KEY, true)
			toast.success('Notifications enabled', {
				description: "You'll receive alerts on this device.",
			})
		},
		onError: (err) => {
			const message = err instanceof Error ? err.message : 'Failed to enable notifications'
			toast.error('Could not enable notifications', { description: message })
		},
	})

	const unsubscribeMutation = useMutation({
		mutationFn: async () => {
			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.getSubscription()

			if (subscription) {
				// Remove from backend
				await api.delete('/api/v1/push/subscribe', { endpoint: subscription.endpoint })
				// Unsubscribe browser
				await subscription.unsubscribe()
			}
		},
		onSuccess: () => {
			queryClient.setQueryData(SUBSCRIPTION_KEY, false)
			toast.success('Notifications disabled')
		},
		onError: () => {
			toast.error('Failed to disable notifications')
		},
	})

	const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending

	return {
		isSupported: supported,
		permission,
		isSubscribed: subscriptionQuery.data ?? false,
		subscribe: async () => {
			if (!supported || isPending) return
			await subscribeMutation.mutateAsync().catch(() => {})
		},
		unsubscribe: async () => {
			if (!supported || isPending) return
			await unsubscribeMutation.mutateAsync().catch(() => {})
		},
		isPending,
	}
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
