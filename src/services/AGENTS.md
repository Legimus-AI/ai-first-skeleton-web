# services/ — External Adapters

fetch/HTTP + SSE/WebSocket + browser Web API wrappers.

## Rules (arch test enforced)

- ❌ imports from `@/slices/*`
- ❌ React hooks, JSX, `.tsx` files
- ❌ Grab-bag: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `shared.ts`
- ✅ Name: `<target>-service.ts` (flat) or `<target>/` (multi-file SDK)
- ✅ Init/get pattern when holding state

## Example

```ts
let client: StripeClient | null = null

export function initStripeService() {
  client = new StripeClient(import.meta.env.VITE_STRIPE_KEY)
}

export async function chargeCard(req: ChargeRequest): Promise<ChargeResponse> {
  if (!client) throw new Error('stripe service not initialized')
  return client.charge(req)
}
```

Full contract: repo-root `AGENTS.md` section "Where to Put New Code".
