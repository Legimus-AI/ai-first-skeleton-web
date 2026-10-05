import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { z } from 'zod'
import { createQueryClient } from '@/services/query-client'
import { TooltipProvider } from '@/ui/tooltip'
import { safeRedirectPath } from '@/utils/safe-redirect'
import { router } from './router'
import './styles.css'

// --- Observability (uncomment to enable) ---
// import './lib/sentry'    // Sentry error tracking + performance
// import './lib/clarity'   // Microsoft Clarity session replay

// Form validation in Spanish: plain copy for the common cases, Zod's Spanish locale for the rest.
z.config({
	...z.locales.es(),
	customError: (issue) => {
		if (issue.code === 'too_small' && issue.origin === 'string') {
			return issue.minimum === 1
				? 'Este campo es obligatorio.'
				: `Usa al menos ${issue.minimum} caracteres.`
		}
		if (issue.code === 'too_big' && issue.origin === 'string') {
			return `Usa como máximo ${issue.maximum} caracteres.`
		}
		if (issue.code === 'invalid_format' && issue.format === 'email') {
			return 'Ingresa un email válido.'
		}
		if (issue.code === 'invalid_type' && issue.input === undefined) {
			return 'Este campo es obligatorio.'
		}
		return undefined
	},
})

// Session lost mid-use (expired, revoked, replaced): drop every cached answer and sign in again,
// coming back to the same page afterwards.
const queryClient = createQueryClient(() => {
	queryClient.clear()
	const { pathname, href } = router.state.location
	// Already on (or heading to) the login: wrapping it again would nest the redirect.
	if (pathname === '/login') return
	void router.navigate({ to: '/login', search: { redirect: safeRedirectPath(href) } })
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider delayDuration={300}>
				<RouterProvider router={router} context={{ queryClient }} />
			</TooltipProvider>
		</QueryClientProvider>
	</StrictMode>,
)
