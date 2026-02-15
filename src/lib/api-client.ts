import type { AppType } from '@repo/api/src/app'
import { hc } from 'hono/client'

// Hono RPC client — type-safe API calls derived from backend routes
export const api = hc<AppType>('/')
