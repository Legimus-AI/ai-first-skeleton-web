import type { OrganizationSettings, UpdateUserSettings, UserSettings } from '@repo/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '@/providers/theme-provider'
import { api } from '@/services/api-client'
import { formatDate } from '@/services/date-format-service'
import {
	organizationSettingsQueryOptions,
	userSettingsQueryOptions,
} from '@/slices/settings/hooks/use-settings'
import { useSettingsSync } from '@/slices/settings/hooks/use-settings-sync'
import { ThemeSegmented } from '@/ui/theme-segmented'
import { ThemeToggle } from '@/ui/theme-toggle'

vi.mock('@/services/api-client', () => ({
	api: { get: vi.fn(), patch: vi.fn() },
}))

vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const mockedGet = vi.mocked(api.get)
const mockedPatch = vi.mocked(api.patch)

// 20:00 UTC: the 12th in Lima, already the 13th in Kiritimati (UTC+14).
const EVENING_IN_UTC = '2026-10-12T20:00:00.000Z'
const organizationSettings: OrganizationSettings = {
	timeZone: 'Pacific/Kiritimati',
	locale: 'en-US',
}
const FIRST_ACCOUNT = 'user-1:organization-1'
const SECOND_ACCOUNT = 'user-2:organization-1'
let accountSettings: UserSettings

function jsonResponse(body: unknown): Response {
	return { ok: true, status: 200, json: () => Promise.resolve(body) } as Response
}

/** The API's merge patch of the person's settings. */
async function saveToAccount(_path: string, patch: unknown): Promise<Response> {
	accountSettings = { ...accountSettings, ...(patch as UpdateUserSettings) } as UserSettings
	return jsonResponse({ data: accountSettings })
}

/** The `_authed` route component: the hook runs once per session, around the pages. */
function SignedInShell({ accountKey }: { accountKey: string }) {
	useSettingsSync(accountKey)
	const { theme, setTheme } = useTheme()
	return (
		<>
			<ThemeToggle />
			<ThemeSegmented value={theme} onChange={setTheme} />
		</>
	)
}

/** The app as the hook meets it: settings already loaded by the `_authed` loader. */
function renderSignedIn(organization = organizationSettings) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	queryClient.setQueryData(userSettingsQueryOptions.queryKey, accountSettings)
	queryClient.setQueryData(organizationSettingsQueryOptions.queryKey, organization)
	const app = (accountKey: string) => (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<SignedInShell accountKey={accountKey} />
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>
	)
	const { rerender, unmount } = render(app(FIRST_ACCOUNT))
	return { queryClient, unmount, switchAccount: (accountKey: string) => rerender(app(accountKey)) }
}

const failedResponse = {
	ok: false,
	status: 500,
	json: () => Promise.resolve({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }),
} as Response

async function settled(queryClient: QueryClient) {
	await waitFor(() => {
		expect(queryClient.isMutating()).toBe(0)
		expect(queryClient.isFetching()).toBe(0)
	})
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.stubGlobal('matchMedia', () => ({
		matches: false,
		addEventListener: () => {},
		removeEventListener: () => {},
	}))
	accountSettings = { theme: 'dark', timeZone: null }
	mockedGet.mockImplementation(async (path) =>
		jsonResponse({
			data: path === '/api/v1/me/settings' ? accountSettings : organizationSettings,
		}),
	)
	mockedPatch.mockImplementation(saveToAccount)
	// The theme this browser remembered from before: the account's must replace it.
	localStorage.setItem('theme', 'light')
})

afterEach(() => {
	cleanup()
	localStorage.clear()
	document.documentElement.classList.remove('dark')
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('useSettingsSync', () => {
	it("applies the account's theme on the first load without saving it back", async () => {
		const { queryClient } = renderSignedIn()

		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		expect(localStorage.getItem('theme')).toBe('dark')
		await settled(queryClient)
		expect(mockedPatch).not.toHaveBeenCalled()
	})

	it('saves a later toggle exactly once', async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))

		fireEvent.click(screen.getByRole('button', { name: 'Cambiar tema' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(1))
		expect(mockedPatch).toHaveBeenCalledWith('/api/v1/me/settings', { theme: 'light' })
		// The save refetches the settings; that answer must not trigger another save.
		await settled(queryClient)
		expect(mockedPatch).toHaveBeenCalledTimes(1)
		expect(document.documentElement.classList.contains('dark')).toBe(false)
		// The theme changing on screen is the feedback: no success toast.
		expect(toast.success).not.toHaveBeenCalled()
	})

	it("puts the account's theme back on screen when saving a toggle fails", async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		mockedPatch.mockResolvedValueOnce(failedResponse)

		fireEvent.click(screen.getByRole('button', { name: 'Cambiar tema' }))

		await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1))
		await settled(queryClient)
		expect(document.documentElement.classList.contains('dark')).toBe(true)
		expect(localStorage.getItem('theme')).toBe('dark')
		expect(mockedPatch).toHaveBeenCalledTimes(1)
		expect(toast.success).not.toHaveBeenCalled()
	})

	it("does not apply the account's theme again later in the session", async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))

		// Another device changed it: this tab keeps its theme until the next session.
		accountSettings = { theme: 'light', timeZone: null }
		act(() => {
			queryClient.setQueryData(userSettingsQueryOptions.queryKey, accountSettings)
		})

		await settled(queryClient)
		expect(document.documentElement.classList.contains('dark')).toBe(true)
		expect(mockedPatch).not.toHaveBeenCalled()
	})

	it("formats dates in the person's zone, or else the organization's, after every change", async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe('13'))
		expect(formatDate(EVENING_IN_UTC, { month: 'long' })).toBe('October')

		act(() => {
			queryClient.setQueryData(userSettingsQueryOptions.queryKey, {
				theme: 'dark',
				timeZone: 'America/Lima',
			})
		})

		await waitFor(() => expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe('12'))
	})

	it('goes back to the theme the server confirmed when a later quick save fails', async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		mockedPatch.mockImplementationOnce(saveToAccount).mockResolvedValueOnce(failedResponse)

		fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
		fireEvent.click(screen.getByRole('button', { name: 'Sistema' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(2))
		await settled(queryClient)
		expect(accountSettings.theme).toBe('light')
		expect(localStorage.getItem('theme')).toBe('light')
		expect(toast.error).toHaveBeenCalledWith('No pudimos guardar el tema. Intenta de nuevo.')
	})

	it('keeps a later choice that saved after an earlier quick save failed', async () => {
		const { queryClient } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		mockedPatch.mockResolvedValueOnce(failedResponse)

		fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
		fireEvent.click(screen.getByRole('button', { name: 'Sistema' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(2))
		await settled(queryClient)
		expect(accountSettings.theme).toBe('system')
		// "system" is not stored: the browser follows the device.
		expect(localStorage.getItem('theme')).toBeNull()
		expect(document.documentElement.classList.contains('dark')).toBe(false)
	})

	it('saves the toggles of another account whose settings match the previous one', async () => {
		const { queryClient, switchAccount } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		await act(() => queryClient.resetQueries())
		switchAccount(SECOND_ACCOUNT)

		fireEvent.click(screen.getByRole('button', { name: 'Claro' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(1))
		expect(mockedPatch).toHaveBeenCalledWith('/api/v1/me/settings', { theme: 'light' })
	})

	it("does not save the previous account's theme into a new one when its save fails late", async () => {
		const { queryClient, switchAccount } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
		let answerSave: (response: Response) => void = () => {}
		mockedPatch.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					answerSave = resolve
				}),
		)
		fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(1))

		accountSettings = { theme: 'light', timeZone: null }
		await act(() => queryClient.resetQueries())
		switchAccount(SECOND_ACCOUNT)
		await act(async () => answerSave(failedResponse))

		await settled(queryClient)
		expect(mockedPatch).toHaveBeenCalledTimes(1)
		expect(localStorage.getItem('theme')).toBe('light')
	})

	it('warns once, in the shell, when this browser cannot format the zone', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const { queryClient } = renderSignedIn({ timeZone: 'Mars/Olympus', locale: 'es-PE' })

		await waitFor(() => expect(toast.warning).toHaveBeenCalledTimes(1))
		expect(toast.warning).toHaveBeenCalledWith(
			expect.stringContaining('Tu navegador no reconoce la zona Mars/Olympus'),
		)
		// A theme save refetches the settings: that must not warn again.
		fireEvent.click(screen.getByRole('button', { name: 'Cambiar tema' }))
		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(1))
		await settled(queryClient)
		expect(toast.warning).toHaveBeenCalledTimes(1)
	})

	it("applies another account's theme once its settings are loaded, without saving", async () => {
		const { queryClient, switchAccount } = renderSignedIn()
		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))

		// The other tab's account: its settings load, then the shell names that account.
		accountSettings = { theme: 'light', timeZone: null }
		await act(() => queryClient.resetQueries())
		expect(document.documentElement.classList.contains('dark')).toBe(true)
		switchAccount(SECOND_ACCOUNT)

		await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false))
		await settled(queryClient)
		expect(mockedPatch).not.toHaveBeenCalled()
	})

	it('puts the build locale and the browser zone back when the shell unmounts', async () => {
		const { unmount } = renderSignedIn()
		await waitFor(() => expect(formatDate(EVENING_IN_UTC, { day: 'numeric' })).toBe('13'))

		unmount()

		expect(formatDate(EVENING_IN_UTC, { month: 'long', year: 'numeric' })).toBe('octubre de 2026')
	})
})
