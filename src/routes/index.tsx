import { createFileRoute } from '@tanstack/react-router'
import { TodoList } from '@/slices/todos/components/todo-list'

export const Route = createFileRoute('/')({
	component: IndexPage,
})

function IndexPage() {
	return (
		<div className="min-h-screen bg-muted/50 px-4 py-6 md:py-12">
			<div className="mx-auto max-w-lg">
				<h1 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
					AI First Skeleton
				</h1>
				<p className="mb-6 text-center text-sm text-muted-foreground">
					Boundary Slices + Schema-First + Verifier-First
				</p>
				<TodoList />
			</div>
		</div>
	)
}
