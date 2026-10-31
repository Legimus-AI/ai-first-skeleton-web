/// <reference lib="webworker" />

// Push notification service worker.
// Receives push events from the server and displays native browser notifications.
// Handles notification clicks by opening the specified URL, only when it is on this site.

/** The URL when it stays on this site; a push payload naming another origin opens nothing. */
function sameOriginUrl(url) {
	if (typeof url !== 'string' || url === '') return null
	try {
		const parsed = new URL(url, self.location.origin)
		return parsed.origin === self.location.origin ? parsed.href : null
	} catch {
		return null
	}
}

self.addEventListener('push', (event) => {
	if (!event.data) return

	const payload = event.data.json()
	const { title, body, url, icon } = payload

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: icon || '/favicon.ico',
			badge: '/favicon.ico',
			data: { url },
		}),
	)
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	const url = sameOriginUrl(event.notification.data?.url)
	if (!url) return

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			// Focus existing tab if open
			for (const client of clientList) {
				if (client.url === url && 'focus' in client) {
					return client.focus()
				}
			}
			// Open new tab
			if (self.clients.openWindow) {
				return self.clients.openWindow(url)
			}
		}),
	)
})
