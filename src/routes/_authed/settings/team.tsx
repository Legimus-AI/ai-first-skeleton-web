// @generated-by-ai-first-skeleton — do not remove this line
import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/hooks/use-query-params'
import { ignoreCancelled } from '@/services/query-client'
import { TeamList } from '@/slices/team/components/team-list'
import { teamQueryOptions } from '@/slices/team/hooks/use-team'

export const Route = createFileRoute('/_authed/settings/team')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps }) =>
		context.queryClient
			.ensureQueryData({ ...teamQueryOptions(deps), revalidateIfStale: true })
			.catch(ignoreCancelled),
	component: TeamPage,
})

function TeamPage() {
	return <TeamList />
}
