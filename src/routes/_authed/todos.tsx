import { createFileRoute } from '@tanstack/react-router'
import { parseListParams } from '@/lib/use-query-params'
import { TodoList } from '@/slices/todos/components/todo-list'

export const Route = createFileRoute('/_authed/todos')({
	validateSearch: (s: Record<string, unknown>) => parseListParams(s),
	component: TodosPage,
})

function TodosPage() {
	return <TodoList />
}
