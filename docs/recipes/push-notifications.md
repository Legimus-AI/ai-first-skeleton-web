# Push Notifications

Browser push notifications — zero external services, zero cost.

## Setup

### 1. Generate VAPID keys (one time)

```bash
npx web-push generate-vapid-keys
```

### 2. Add to `.env`

```bash
VAPID_PUBLIC_KEY=BEl62iUYgU...
VAPID_PRIVATE_KEY=UYI-Fk...
VAPID_SUBJECT=mailto:push@yourdomain.com
```

### 3. Install web-push (backend)

```bash
cd apps/api && pnpm add web-push
```

That's it. The skeleton auto-configures the push sender on startup.

## Frontend Usage

```tsx
import { usePushNotifications } from '@/utils/use-push-notifications'

function NotificationToggle() {
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe, isPending } =
    usePushNotifications()

  if (!isSupported) return null
  if (permission === 'denied') return <p>Notifications blocked in browser settings</p>

  return (
    <Button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isPending}>
      {isSubscribed ? 'Disable' : 'Enable'} notifications
    </Button>
  )
}
```

## Backend Usage (sending push from any slice)

```typescript
import { sendPushToUser } from '../../lib/push'

// Send to all devices of a user
await sendPushToUser(userId, {
  title: 'New conversation',
  body: 'A customer just sent a message',
  url: '/conversations/123',
  icon: '/logo.png',
})
```

## How it Works

1. Frontend calls `subscribe()` → browser shows permission dialog
2. If allowed → service worker registers + gets push subscription
3. Subscription sent to backend → saved in `push_subscriptions` table
4. Backend calls `sendPushToUser(userId, payload)` → native notification appears
5. User clicks notification → opens the specified URL

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/push/vapid-key` | No | Get VAPID public key |
| POST | `/api/v1/push/subscribe` | Yes | Save push subscription |
| DELETE | `/api/v1/push/subscribe` | Yes | Remove push subscription |

## Auto-Cleanup

Invalid subscriptions (browser uninstalled, permission revoked) return HTTP 410 Gone from the push service. The backend automatically deletes these on send failure.

## Browser Support

Chrome, Firefox, Edge, Safari 16.4+ (iOS/macOS). Covers ~95% of users.
`usePushNotifications()` returns `isSupported: false` on unsupported browsers.
