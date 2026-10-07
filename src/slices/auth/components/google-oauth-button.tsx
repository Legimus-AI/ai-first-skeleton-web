import { getEnv } from '@/env'
import { Button } from '@/ui/button'
import { type SignInTarget, useGoogleSignIn } from '../hooks/use-auth'
import { GoogleIcon } from './google-icon'

/** "Continuar con Google" above the email form, when `VITE_GOOGLE_AUTH` turns Google on. */
export function GoogleOAuthButton(target: SignInTarget) {
	const googleSignIn = useGoogleSignIn(target)
	if (!getEnv().VITE_GOOGLE_AUTH) return null

	return (
		<div className="space-y-4">
			<Button
				type="button"
				variant="outline"
				className="w-full"
				loading={googleSignIn.isPending}
				onClick={() => googleSignIn.mutate()}
			>
				{!googleSignIn.isPending && <GoogleIcon className="mr-1.5 h-4 w-4" />}
				Continuar con Google
			</Button>
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
