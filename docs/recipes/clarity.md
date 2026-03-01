# Microsoft Clarity Integration

Session replay and heatmaps.

## 1. Install

```bash
pnpm add clarity-js
```

Or use the script tag approach (no package needed).

## 2. Create `src/lib/clarity.ts`

### Option A: clarity-js package

```ts
import { clarity } from 'clarity-js'

const clarityId = import.meta.env.VITE_CLARITY_ID
if (clarityId) {
  clarity.start({
    projectId: clarityId,
    upload: 'https://m.clarity.ms/collect',
    track: true,
    content: true,
  })
}

/** Call on auth to tag sessions with user identity */
export function identifyUser(userId: string) {
  clarity.identify(userId)
}
```

### Option B: Script tag

```ts
const clarityId = import.meta.env.VITE_CLARITY_ID
if (clarityId) {
  const script = document.createElement('script')
  script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`
  document.head.appendChild(script)
}
```

## 3. Enable in `main.tsx`

Uncomment the import:

```ts
import './lib/clarity'
```

## 4. Environment variable

Add to `.env`:

```
VITE_CLARITY_ID=your-clarity-project-id
```

## User identification

Call `identifyUser(userId)` after successful authentication to tag Clarity sessions with the logged-in user.
