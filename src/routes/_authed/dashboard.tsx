import { createFileRoute } from '@tanstack/react-router'
import { useCompletedTodosCount, useTodos } from '@/slices/todos/hooks/use-todos'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { FadeIn } from '@/ui/fade-in'
import { CheckCircle, Clock, ListTodo } from '@/ui/icons'
import { InlineError } from '@/ui/inline-error'
import { Skeleton } from '@/ui/skeleton'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'

export const Route = createFileRoute('/_authed/dashboard')({
	component: DashboardPage,
})

function DashboardPage() {
	const latest = useTodos({ limit: 5 })
	const completed = useCompletedTodosCount()
	const error = latest.error ?? completed.error

	if (error) {
		return (
			<InlineError
				error={error}
				onRetry={() => {
					void latest.refetch()
					void completed.refetch()
				}}
			/>
		)
	}

	const stats = [
		{ label: 'Tareas totales', value: latest.data?.meta.total },
		{ label: 'Completadas', value: completed.data },
	]

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader title="Dashboard" description="Un resumen de tus tareas." />

			<div className="grid gap-6 sm:grid-cols-2">
				{stats.map((stat) => (
					<Card key={stat.label}>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-semibold tracking-tight">
								{stat.value === undefined ? <Skeleton className="h-9 w-16" /> : stat.value}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-medium">Últimas tareas</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{latest.isLoading ? (
							['sk-1', 'sk-2', 'sk-3', 'sk-4'].map((id) => (
								<div key={id} className="flex items-center gap-4 rounded-lg p-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[180px]" />
										<Skeleton className="h-3 w-[100px]" />
									</div>
								</div>
							))
						) : latest.data?.data.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<ListTodo className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
								<p className="mt-4 text-sm font-medium text-foreground">Aún no tienes tareas</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Las que crees en Tareas aparecerán aquí.
								</p>
							</div>
						) : (
							latest.data?.data.map((todo) => (
								<div
									key={todo.id}
									className="-mx-3 flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-accent/60"
								>
									{todo.completed ? (
										<CheckCircle
											weight="fill"
											className="mt-0.5 h-4 w-4 shrink-0 text-primary"
											aria-label="Completada"
										/>
									) : (
										<Clock
											className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
											aria-label="Pendiente"
										/>
									)}
									<div className="flex min-w-0 flex-1 flex-col gap-1">
										<div className="flex items-start justify-between gap-2">
											<p
												className={cn(
													'min-w-0 text-sm font-medium leading-none tracking-tight break-words',
													todo.completed ? 'text-muted-foreground line-through' : 'text-foreground',
												)}
											>
												{todo.title}
											</p>
											<span className="shrink-0 text-2xs tabular-nums text-muted-foreground">
												{formatDate(todo.createdAt)}
											</span>
										</div>
										{todo.description && (
											<p className="line-clamp-1 text-xs text-muted-foreground break-all">
												{todo.description}
											</p>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</FadeIn>
	)
}
