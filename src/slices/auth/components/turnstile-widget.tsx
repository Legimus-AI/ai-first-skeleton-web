import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

// Cloudflare's script, rendered explicitly so each form owns its widget (and can remount it).
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileApi {
	render(
		container: HTMLElement,
		options: {
			sitekey: string
			callback: (token: string) => void
			'expired-callback': () => void
			'error-callback': () => void
		},
	): string
	remove(widgetId: string): void
}

declare global {
	interface Window {
		turnstile?: TurnstileApi
	}
}

let turnstileScript: Promise<TurnstileApi> | null = null

/** Loads Cloudflare's script once per page; later widgets reuse it. */
function loadTurnstile(): Promise<TurnstileApi> {
	turnstileScript ??= new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = TURNSTILE_SCRIPT_URL
		script.async = true
		script.onload = () =>
			window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing'))
		script.onerror = () => {
			turnstileScript = null
			reject(new Error('Turnstile script failed to load'))
		}
		document.head.append(script)
	})
	return turnstileScript
}

/** The line that says why the submit is disabled; the submit points at it (`aria-describedby`). */
export const CAPTCHA_STATUS_ID = 'captcha-status'

interface TurnstileWidgetProps {
	siteKey: string
	/** Called with a fresh token, or null when it expires or the check fails. Must be stable. */
	onToken: (token: string | null) => void
}

/** Cloudflare Turnstile: usually invisible; its token goes in Better Auth's captcha header. */
export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [status, setStatus] = useState<'checking' | 'verified' | 'failed'>('checking')

	useEffect(() => {
		let widgetId: string | undefined
		let unmounted = false
		loadTurnstile().then(
			(turnstile) => {
				if (unmounted || !containerRef.current) return
				widgetId = turnstile.render(containerRef.current, {
					sitekey: siteKey,
					callback: (token) => {
						setStatus('verified')
						onToken(token)
					},
					'expired-callback': () => {
						setStatus('checking')
						onToken(null)
					},
					// The widget stays mounted after an error: Turnstile retries by itself.
					'error-callback': () => {
						setStatus('failed')
						onToken(null)
					},
				})
			},
			() => setStatus('failed'),
		)
		return () => {
			unmounted = true
			if (widgetId) window.turnstile?.remove(widgetId)
		}
	}, [siteKey, onToken])

	return (
		<div className="space-y-2">
			<div ref={containerRef} className="flex min-h-0 justify-center" />
			{status !== 'verified' && (
				<p
					id={CAPTCHA_STATUS_ID}
					role={status === 'failed' ? 'alert' : 'status'}
					className={cn(
						'text-center text-xs',
						status === 'failed' ? 'text-destructive' : 'text-muted-foreground',
					)}
				>
					{status === 'failed'
						? 'No pudimos verificar que eres una persona. Si no se resuelve en unos segundos, recarga la página.'
						: 'Verificando que eres una persona…'}
				</p>
			)}
		</div>
	)
}
