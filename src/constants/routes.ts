import type { RegisteredRouter } from '@tanstack/react-router'

/**
 * Where a signed-in user lands: after login or sign-up and from `/`. Any route works, a list
 * route included (its `validateSearch` fills the defaults); a path that is not a route fails typecheck.
 */
export const HOME_PATH = '/dashboard' satisfies keyof RegisteredRouter['routesByPath']
