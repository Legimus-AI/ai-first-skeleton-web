/** The invite form and the roles this page hands out, built from the shared team schema. */
import { assignableRoleSchema, teamMemberSchema } from '@repo/shared'
import type { z } from 'zod'

// WHY: an invitation never grants ownership; an owner hands it over later, in the role select.
export const inviteMemberFormSchema = teamMemberSchema
	.pick({ email: true })
	.extend({ role: assignableRoleSchema })
export type InviteMemberForm = z.infer<typeof inviteMemberFormSchema>
