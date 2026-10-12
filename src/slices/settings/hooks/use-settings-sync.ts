import type { Theme } from '@repo/shared'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useTheme } from '@/providers/theme-provider'
import { getUnsupportedTimeZone, resetDateFormatPreferences } from '@/services/date-format-service'
import {
	applyDatePreferences,
	unsupportedTimeZoneMessage,
	useOrganizationSettings,
	useSaveTheme,
	useUserSettings,
} from './use-settings'

interface ThemeSyncState {
	/** `userId:organizationId` of the account this state belongs to. */
	accountKey: string
	/** The theme the account holds, as far as this tab knows (saves in flight included). */
	accountTheme: Theme
	/** The last theme the server confirmed: where a failed save goes back to. */
	confirmedTheme: Theme
	/** True until the provider shows the account's theme after the first load. */
	isReconciling: boolean
}

/**
 * Keeps the account's settings applied while signed in: dates follow them, the account's theme
 * wins on the first load of the session (and of each account), and every later change is saved once.
 * `accountKey` names the account whose data the cache holds (`useReloadOnAccountSwitch`).
 */
export function useSettingsSync(accountKey: string | null): void {
	const { theme, setTheme } = useTheme()
	const { data: userSettings } = useUserSettings()
	const { data: organizationSettings } = useOrganizationSettings()
	// WHY: per-call promises; `mutate`'s callbacks fire only for the latest call, not each save.
	const { mutateAsync: saveTheme } = useSaveTheme()
	const themeSyncRef = useRef<ThemeSyncState | null>(null)
	const warnedTimeZoneRef = useRef<string | null>(null)

	useEffect(() => {
		if (!userSettings || !organizationSettings) return
		applyDatePreferences(userSettings, organizationSettings)
		// Every page shows dates, so the warning shows once here too, not only on the settings pages.
		const unsupportedTimeZone = getUnsupportedTimeZone()
		if (unsupportedTimeZone && unsupportedTimeZone !== warnedTimeZoneRef.current) {
			warnedTimeZoneRef.current = unsupportedTimeZone
			toast.warning(unsupportedTimeZoneMessage(unsupportedTimeZone))
		}
		// Leaving the signed-in shell (login, `_session/*` pages): the build locale and browser zone.
		return resetDateFormatPreferences
	}, [userSettings, organizationSettings])

	useEffect(() => {
		if (!userSettings || !accountKey) return
		const themeSyncState = themeSyncRef.current
		// Another account's data is in the cache: its theme wins once, as on the first load.
		if (themeSyncState?.accountKey !== accountKey) {
			const isDifferentFromAccount = theme !== userSettings.theme
			themeSyncRef.current = {
				accountKey,
				accountTheme: userSettings.theme,
				confirmedTheme: userSettings.theme,
				isReconciling: isDifferentFromAccount,
			}
			if (isDifferentFromAccount) setTheme(userSettings.theme)
			return
		}
		if (theme === themeSyncState.accountTheme) {
			themeSyncState.isReconciling = false
			return
		}
		// WHY: until the provider re-renders with the account's theme, a different value is the stale
		// local one (StrictMode re-runs this effect with it), never a choice to save.
		if (themeSyncState.isReconciling) return
		themeSyncState.accountTheme = theme
		// Saves run one at a time (mutation scope), so they settle in the order they were made.
		saveTheme(theme).then(
			() => {
				themeSyncState.confirmedTheme = theme
			},
			() => {
				// WHY: a later choice already holds the account's theme, or another account signed in
				// (a rollback would then save this account's theme into that one).
				if (themeSyncRef.current !== themeSyncState || themeSyncState.accountTheme !== theme) return
				themeSyncState.accountTheme = themeSyncState.confirmedTheme
				setTheme(themeSyncState.confirmedTheme)
			},
		)
	}, [accountKey, userSettings, theme, setTheme, saveTheme])
}
