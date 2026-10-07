import type { MemberRole } from '@repo/shared'

/** How a member's role reads in the UI (team table, invitations). */
export const MEMBER_ROLE_LABELS: Readonly<Record<MemberRole, string>> = {
	owner: 'Propietario',
	admin: 'Administrador',
	user: 'Miembro',
}
