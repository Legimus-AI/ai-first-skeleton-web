import {
	ORGANIZATION_SETTINGS_DEFAULTS,
	type OrganizationSettings,
	type UpdateOrganizationSettings,
} from '@repo/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api-client'
import {
	resetDateFormatPreferences,
	setDateFormatPreferences,
} from '@/services/date-format-service'
import { OrganizationSettingsPage } from '@/slices/settings/components/organization-settings-page'
import { organizationSettingsQueryOptions } from '@/slices/settings/hooks/use-settings'

vi.mock('@/services/api-client', () => ({
	api: { get: vi.fn(), patch: vi.fn() },
}))

vi.mock('sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedPatch = vi.mocked(api.patch)
let storedSettings: OrganizationSettings

function jsonResponse(body: unknown): Response {
	return { ok: true, status: 200, json: () => Promise.resolve(body) } as Response
}

function renderForm(settings: OrganizationSettings) {
	storedSettings = settings
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	queryClient.setQueryData(organizationSettingsQueryOptions.queryKey, settings)
	render(
		<QueryClientProvider client={queryClient}>
			<OrganizationSettingsPage canEdit />
		</QueryClientProvider>,
	)
}

const isSaveDisabled = () =>
	screen.getByRole<HTMLButtonElement>('button', { name: 'Guardar cambios' }).disabled

beforeEach(() => {
	vi.clearAllMocks()
	// The API's merge patch: a value sets the key, null puts its default back.
	mockedPatch.mockImplementation(async (_path, body) => {
		const patch = body as UpdateOrganizationSettings
		storedSettings = {
			timeZone:
				patch.timeZone === null
					? ORGANIZATION_SETTINGS_DEFAULTS.timeZone
					: (patch.timeZone ?? storedSettings.timeZone),
			locale:
				patch.locale === null
					? ORGANIZATION_SETTINGS_DEFAULTS.locale
					: (patch.locale ?? storedSettings.locale),
		}
		return jsonResponse({ data: storedSettings })
	})
})

afterEach(() => {
	cleanup()
	resetDateFormatPreferences()
	vi.restoreAllMocks()
})

describe('OrganizationSettingsForm', () => {
	it('sends only the keys changed since the last save', async () => {
		renderForm(ORGANIZATION_SETTINGS_DEFAULTS)
		expect(isSaveDisabled()).toBe(true)

		fireEvent.change(screen.getByLabelText('Formato regional'), { target: { value: 'en-US' } })
		fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

		await waitFor(() =>
			expect(mockedPatch).toHaveBeenCalledWith('/api/v1/organization/settings', {
				locale: 'en-US',
			}),
		)
		await waitFor(() => expect(isSaveDisabled()).toBe(true))

		fireEvent.change(screen.getByLabelText('Zona horaria'), { target: { value: 'Europe/Madrid' } })
		fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(2))
		expect(mockedPatch).toHaveBeenLastCalledWith('/api/v1/organization/settings', {
			timeZone: 'Europe/Madrid',
		})
	})

	it('"Restablecer" sends null for that key alone and shows the default', async () => {
		renderForm({ ...ORGANIZATION_SETTINGS_DEFAULTS, timeZone: 'Europe/Madrid' })
		expect(screen.queryByRole('button', { name: 'Restablecer el formato regional' })).toBeNull()

		fireEvent.click(screen.getByRole('button', { name: 'Restablecer la zona horaria' }))

		await waitFor(() =>
			expect(screen.queryByRole('button', { name: 'Restablecer la zona horaria' })).toBeNull(),
		)
		expect(mockedPatch).toHaveBeenCalledTimes(1)
		expect(mockedPatch).toHaveBeenCalledWith('/api/v1/organization/settings', { timeZone: null })
		expect(screen.getByLabelText<HTMLSelectElement>('Zona horaria').value).toBe('America/Lima')
		expect(isSaveDisabled()).toBe(true)
		// The button left with the custom value: focus lands on the field it reset.
		expect(document.activeElement).toBe(screen.getByLabelText('Zona horaria'))
	})

	it('shows the default and disables Save after saving a field and then restoring it', async () => {
		renderForm(ORGANIZATION_SETTINGS_DEFAULTS)
		fireEvent.change(screen.getByLabelText('Zona horaria'), { target: { value: 'Europe/Madrid' } })
		fireEvent.change(screen.getByLabelText('Formato regional'), { target: { value: 'es-ES' } })
		fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
		await waitFor(() => expect(isSaveDisabled()).toBe(true))

		fireEvent.click(screen.getByRole('button', { name: 'Restablecer la zona horaria' }))

		await waitFor(() =>
			expect(screen.queryByRole('button', { name: 'Restablecer la zona horaria' })).toBeNull(),
		)
		expect(mockedPatch).toHaveBeenLastCalledWith('/api/v1/organization/settings', {
			timeZone: null,
		})
		expect(screen.getByLabelText<HTMLSelectElement>('Zona horaria').value).toBe('America/Lima')
		expect(screen.getByLabelText<HTMLSelectElement>('Formato regional').value).toBe('es-ES')
		expect(isSaveDisabled()).toBe(true)
	})

	it('keeps an unsaved change of the other field when one field is restored', async () => {
		renderForm({ ...ORGANIZATION_SETTINGS_DEFAULTS, timeZone: 'Europe/Madrid' })
		fireEvent.change(screen.getByLabelText('Formato regional'), { target: { value: 'en-US' } })

		fireEvent.click(screen.getByRole('button', { name: 'Restablecer la zona horaria' }))

		await waitFor(() =>
			expect(screen.getByLabelText<HTMLSelectElement>('Zona horaria').value).toBe('America/Lima'),
		)
		expect(screen.getByLabelText<HTMLSelectElement>('Formato regional').value).toBe('en-US')
		expect(isSaveDisabled()).toBe(false)

		fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

		await waitFor(() => expect(mockedPatch).toHaveBeenCalledTimes(2))
		expect(mockedPatch).toHaveBeenLastCalledWith('/api/v1/organization/settings', {
			locale: 'en-US',
		})
	})

	it('warns about a saved zone this browser cannot format and still saves the locale', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		setDateFormatPreferences({ locale: 'es-PE', timeZone: 'Mars/Olympus' })
		renderForm({ ...ORGANIZATION_SETTINGS_DEFAULTS, timeZone: 'Mars/Olympus' })

		expect(screen.getByText(/Tu navegador no reconoce la zona Mars\/Olympus/)).toBeTruthy()
		expect(screen.getByLabelText<HTMLSelectElement>('Zona horaria').value).toBe('Mars/Olympus')

		fireEvent.change(screen.getByLabelText('Formato regional'), { target: { value: 'en-US' } })
		fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

		await waitFor(() =>
			expect(mockedPatch).toHaveBeenCalledWith('/api/v1/organization/settings', {
				locale: 'en-US',
			}),
		)
	})
})
