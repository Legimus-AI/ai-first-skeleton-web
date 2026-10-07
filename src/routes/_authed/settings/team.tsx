// @generated-by-ai-first-skeleton — do not remove this line
import { createFileRoute } from '@tanstack/react-router'
import { type ListParams, parseListParams } from '@/hooks/use-query-params'
import { ignoreCancelled } from '@/services/query-client'
import { TeamList } from '@/slices/team/components/team-list'
import { teamQueryOptions } from '@/slices/team/hooks/use-team'

export const Route = createFileRoute('/_authed/settings/team')({
	// The pending invitations under the members have a page of their own, in the URL once paged.
	validateSearch: (s: Record<string, unknown>): ListParams & { invitationsPage?: number } => ({
		...parseListParams(s),
		...(s.invitationsPage !== undefined && {
			invitationsPage: parseListParams({ page: s.invitationsPage }).page,
		}),
	}),
	// The loader fetches what TeamList renders first: the members, not the invitations' page.
	loaderDeps: ({ search: { invitationsPage, ...members } }) => members,
	loader: ({ context, deps }) =>
		context.queryClient
			.ensureQueryData({ ...teamQueryOptions(deps), revalidateIfStale: true })
			.catch(ignoreCancelled),
	component: TeamPage,
})

function TeamPage() {
	return <TeamList />
}
