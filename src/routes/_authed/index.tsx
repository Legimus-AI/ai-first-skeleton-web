import { createFileRoute } from '@tanstack/react-router'
import { TodoList } from '@/slices/todos/components/todo-list'

export const Route = createFileRoute('/_authed/')({
	component: IndexPage,
})

function IndexPage() {
	return <TodoList />
}
