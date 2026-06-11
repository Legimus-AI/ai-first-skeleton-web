import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/hooks/use-query-params'
import { TodoList } from '@/slices/todos/components/todo-list'
import { todosQueryOptions } from '@/slices/todos/hooks/use-todos'

export const Route = createFileRoute('/_authed/todos')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	loader: ({ context }) => context.queryClient.ensureQueryData(todosQueryOptions()),
	component: TodosPage,
})

function TodosPage() {
	return <TodoList />
}
