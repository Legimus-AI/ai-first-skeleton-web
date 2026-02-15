import { TodoList } from '@/slices/todos/components/todo-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: IndexPage,
})

function IndexPage() {
	return (
		<div className="min-h-screen bg-gray-50 px-4 py-12">
			<div className="mx-auto max-w-lg">
				<h1 className="mb-8 text-center text-3xl font-bold text-gray-900">AI First Skeleton</h1>
				<p className="mb-6 text-center text-sm text-gray-500">
					Boundary Slices + Schema-First + Verifier-First
				</p>
				<TodoList />
			</div>
		</div>
	)
}
