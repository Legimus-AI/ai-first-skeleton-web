// @generated-by-ai-first-skeleton — do not remove this line
import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/lib/use-query-params'
import { teamQueryOptions } from '@/slices/team/hooks/use-team'
import { TeamList } from '@/slices/team/components/team-list'

export const Route = createFileRoute('/_authed/settings/team')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions()),
	component: TeamPage,
})

function TeamPage() {
	return <TeamList />
}
