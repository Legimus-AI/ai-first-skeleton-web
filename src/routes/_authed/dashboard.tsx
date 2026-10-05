import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, ListTodo } from 'lucide-react'
import { useCompletedTodosCount, useTodos } from '@/slices/todos/hooks/use-todos'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { FadeIn } from '@/ui/fade-in'
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
		{ label: 'Tareas totales', value: latest.data?.meta.total, icon: ListTodo },
		{ label: 'Completadas', value: completed.data, icon: CheckCircle2 },
	]

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader title="Dashboard" description="Un resumen de tus tareas." />

			<div className="grid gap-6 sm:grid-cols-2">
				{stats.map((stat) => (
					<Card key={stat.label} className="border-border/50 bg-card shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.label}
							</CardTitle>
							<div className="rounded-md bg-muted/50 p-1.5">
								<stat.icon className="h-4 w-4 text-foreground/70" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-semibold tracking-tight tabular-nums">
								{stat.value === undefined ? <Skeleton className="h-9 w-16" /> : stat.value}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="border-border/50 bg-card shadow-sm">
				<CardHeader className="border-b border-border/50 pb-4">
					<CardTitle className="text-lg font-medium">Últimas tareas</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
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
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
									<ListTodo className="h-6 w-6 text-muted-foreground/50" />
								</div>
								<p className="mt-4 text-sm font-medium text-foreground">Aún no tienes tareas</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Las que crees en Tareas aparecerán aquí.
								</p>
							</div>
						) : (
							latest.data?.data.map((todo) => (
								<div
									key={todo.id}
									className="-mx-3 flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30"
								>
									<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm">
										{todo.completed ? (
											<CheckCircle2 className="h-4 w-4 text-primary" />
										) : (
											<Clock className="h-4 w-4 text-muted-foreground/50" />
										)}
									</div>
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
											<span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
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
