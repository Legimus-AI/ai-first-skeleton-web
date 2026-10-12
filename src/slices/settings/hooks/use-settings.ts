import {
	type OrganizationSettings,
	organizationSettingsResponseSchema,
	type Theme,
	type UpdateOrganizationSettings,
	type UpdateUserSettings,
	type UserSettings,
	userSettingsResponseSchema,
} from '@repo/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { api } from '@/services/api-client'
import { safeParseResponse, throwIfNotOk, toUserMessage } from '@/services/api-error'
import {
	getUnsupportedTimeZone,
	setDateFormatPreferences,
	subscribeToDateFormatPreferences,
} from '@/services/date-format-service'

export const SETTINGS_KEY = ['settings'] as const

const USER_SETTINGS_PATH = '/api/v1/me/settings'
const ORGANIZATION_SETTINGS_PATH = '/api/v1/organization/settings'

// WHY: never stale and not refetched on window focus, so one page never mixes two time zones;
// only a save changes them.
const SETTINGS_QUERY_FRESHNESS = {
	staleTime: Number.POSITIVE_INFINITY,
	refetchOnWindowFocus: false,
}

/** The signed-in person's settings, defaults filled in by the API. */
export const userSettingsQueryOptions = queryOptions({
	...SETTINGS_QUERY_FRESHNESS,
	queryKey: [...SETTINGS_KEY, 'me'],
	queryFn: async ({ signal }) => {
		const res = await api.get(USER_SETTINGS_PATH, undefined, signal)
		await throwIfNotOk(res)
		const json = await res.json()
		return safeParseResponse(userSettingsResponseSchema, json).data
	},
})

/** The settings of the person's organization; every member may read them. */
export const organizationSettingsQueryOptions = queryOptions({
	...SETTINGS_QUERY_FRESHNESS,
	queryKey: [...SETTINGS_KEY, 'organization'],
	queryFn: async ({ signal }) => {
		const res = await api.get(ORGANIZATION_SETTINGS_PATH, undefined, signal)
		await throwIfNotOk(res)
		const json = await res.json()
		return safeParseResponse(organizationSettingsResponseSchema, json).data
	},
})

export function useUserSettings() {
	return useQuery(userSettingsQueryOptions)
}

export function useOrganizationSettings() {
	return useQuery(organizationSettingsQueryOptions)
}

/** Dates follow the organization's locale, in the person's time zone or else the organization's. */
export function applyDatePreferences(
	userSettings: UserSettings,
	organizationSettings: OrganizationSettings,
): void {
	setDateFormatPreferences({
		locale: organizationSettings.locale,
		timeZone: userSettings.timeZone ?? organizationSettings.timeZone,
	})
}

/** What a person reads when this browser cannot format their zone (shell toast, settings pages). */
export function unsupportedTimeZoneMessage(timeZone: string): string {
	return `Tu navegador no reconoce la zona ${timeZone}: ves las fechas en la zona de tu dispositivo. Actualiza tu navegador.`
}

/** The account's zone when this browser cannot format it: dates then show in the device's zone. */
export function useUnsupportedTimeZone(): string | null {
	return useSyncExternalStore(subscribeToDateFormatPreferences, getUnsupportedTimeZone)
}

async function patchUserSettings(patch: UpdateUserSettings): Promise<UserSettings> {
	const res = await api.patch(USER_SETTINGS_PATH, patch)
	await throwIfNotOk(res)
	const json = await res.json()
	return safeParseResponse(userSettingsResponseSchema, json).data
}

/**
 * Saves the theme, one save at a time; only a failure toasts. Only `useSettingsSync` calls it:
 * theme controls call `useTheme().setTheme`, and the sync saves the change.
 */
export function useSaveTheme() {
	return useOptimisticMutation<UserSettings, Theme>({
		queryKey: userSettingsQueryOptions.queryKey,
		mutationFn: (theme) => patchUserSettings({ theme }),
		optimisticUpdate: (current, theme) => ({ ...current, theme }),
		successMessage: false,
		errorMessage: 'No pudimos guardar el tema. Intenta de nuevo.',
		scope: { id: 'save-theme' },
	})
}

/** Saves a form of the person's settings: `null` puts a key back to its default. */
export function useUpdateUserSettings() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: patchUserSettings,
		onSuccess: (saved) => {
			// WHY: PATCH answers the whole document, so it replaces the cache without a refetch.
			queryClient.setQueryData(userSettingsQueryOptions.queryKey, saved)
			toast.success('Preferencias guardadas')
		},
		onError: (error) => {
			toast.error('No pudimos guardar tus preferencias', { description: toUserMessage(error) })
		},
	})
}

/** Saves the organization's settings (owner and admin): `null` puts a key back to its default. */
export function useUpdateOrganizationSettings() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (patch: UpdateOrganizationSettings): Promise<OrganizationSettings> => {
			const res = await api.patch(ORGANIZATION_SETTINGS_PATH, patch)
			await throwIfNotOk(res)
			const json = await res.json()
			return safeParseResponse(organizationSettingsResponseSchema, json).data
		},
		onSuccess: (saved) => {
			// WHY: PATCH answers the whole document, so it replaces the cache without a refetch.
			queryClient.setQueryData(organizationSettingsQueryOptions.queryKey, saved)
			toast.success('Configuración guardada')
		},
		onError: (error) => {
			toast.error('No pudimos guardar la configuración', { description: toUserMessage(error) })
		},
	})
}
