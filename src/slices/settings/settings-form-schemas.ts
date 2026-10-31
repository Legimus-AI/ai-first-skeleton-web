/** The person's time zone form, built from the shared reply shape: only the server validates a zone. */
import { renameOrganizationSchema, userSettingsResponseSchema } from '@repo/shared'
import type { z } from 'zod'

export const userTimeZoneFormSchema = userSettingsResponseSchema.shape.data.pick({ timeZone: true })
export type UserTimeZoneFormValues = z.infer<typeof userTimeZoneFormSchema>

/** The rename sends the shared rule's name: one to 100 characters. */
export const organizationNameFormSchema = renameOrganizationSchema
export type OrganizationNameFormValues = z.infer<typeof organizationNameFormSchema>
