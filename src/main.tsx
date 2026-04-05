import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/ui/tooltip'
import { router } from './router'
import './styles.css'

// --- Observability (uncomment to enable) ---
// import './lib/sentry'    // Sentry error tracking + performance
// import './lib/clarity'   // Microsoft Clarity session replay

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: 1, staleTime: 5_000 },
	},
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
