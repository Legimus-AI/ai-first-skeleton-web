/** The invite form and the roles this page hands out, built from the shared team schema. */
import { assignableRoleSchema, teamMemberSchema } from '@repo/shared'
import type { z } from 'zod'

/** Ownership is never given from the team page. */
export type AssignableRole = z.infer<typeof assignableRoleSchema>

export const inviteMemberFormSchema = teamMemberSchema
	.pick({ email: true })
	.extend({ role: assignableRoleSchema })
export type InviteMemberForm = z.infer<typeof inviteMemberFormSchema>
