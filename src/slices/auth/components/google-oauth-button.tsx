import { getEnv } from '@/env'
import { GoogleIcon } from './google-icon'

export function GoogleOAuthButton() {
	if (!getEnv().VITE_GOOGLE_AUTH) return null

	return (
		<div className="space-y-4">
			<a
				href="/api/v1/auth/google"
				className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<GoogleIcon className="h-4 w-4" />
				Continuar con Google
			</a>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-card px-2 text-muted-foreground">o</span>
				</div>
			</div>
		</div>
	)
}
