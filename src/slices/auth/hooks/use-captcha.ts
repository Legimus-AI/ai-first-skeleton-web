import { useState } from 'react'
import { getEnv } from '@/env'

/**
 * The Turnstile token for the next submit, when `VITE_TURNSTILE_SITE_KEY` is set. A token is spent
 * on every try, so `renew` remounts the widget (render it with `key={captcha.round}`).
 */
export function useCaptcha() {
	const siteKey = getEnv().VITE_TURNSTILE_SITE_KEY
	const [token, setToken] = useState<string | null>(null)
	const [round, setRound] = useState(0)
	return {
		siteKey,
		token,
		setToken,
		round,
		/** False while the widget has not produced a token yet. */
		ready: !siteKey || token !== null,
		renew: () => {
			setToken(null)
			setRound((current) => current + 1)
		},
	}
}
