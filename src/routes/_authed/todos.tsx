import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/hooks/use-query-params'
import { ignoreCancelled } from '@/services/query-client'
import { TodoList } from '@/slices/todos/components/todo-list'
import { todosQueryOptions } from '@/slices/todos/hooks/use-todos'

export const Route = createFileRoute('/_authed/todos')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	// The loader fetches exactly the page the component renders: one request, same cache entry.
	// revalidateIfStale: revisiting re-asks the API in the background, so a lost session shows up.
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps }) =>
		context.queryClient
			.ensureQueryData({ ...todosQueryOptions(deps), revalidateIfStale: true })
			.catch(ignoreCancelled),
	component: TodosPage,
})

function TodosPage() {
	return <TodoList />
}
