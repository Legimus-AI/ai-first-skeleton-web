import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, CheckCircle2, Clock, ListTodo, TrendingUp, Users } from 'lucide-react'
import { useTodos } from '@/slices/todos/hooks/use-todos'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { FadeIn } from '@/ui/fade-in'
import { Skeleton } from '@/ui/skeleton'

export const Route = createFileRoute('/_authed/dashboard')({
	component: DashboardPage,
})

// Mock data for the chart
const mockChartData = [
	{ label: 'Ene', value: 35 },
	{ label: 'Feb', value: 45 },
	{ label: 'Mar', value: 30 },
	{ label: 'Abr', value: 60 },
	{ label: 'May', value: 75 },
	{ label: 'Jun', value: 65 },
	{ label: 'Jul', value: 85 },
	{ label: 'Ago', value: 70 },
	{ label: 'Sep', value: 90 },
	{ label: 'Oct', value: 100 },
	{ label: 'Nov', value: 85 },
	{ label: 'Dic', value: 110 },
]

function DashboardPage() {
	const { data: todos, isLoading } = useTodos({ limit: 5 })
	const maxValue = Math.max(...mockChartData.map((d) => d.value))

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Dashboard"
				description="Bienvenido de vuelta. Aquí tienes un resumen de tu actividad."
			/>

			{/* Stats Grid */}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tareas Totales
						</CardTitle>
						<div className="rounded-md bg-muted/50 p-1.5">
							<ListTodo className="h-4 w-4 text-foreground/70" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold tracking-tight tabular-nums">
							{isLoading ? <Skeleton className="h-9 w-16" /> : (todos?.meta.total ?? 0)}
						</div>
						<div className="mt-2 flex items-center text-xs">
							<span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 font-medium text-success">
								<ArrowUpRight className="mr-0.5 h-3 w-3" />
								+20%
							</span>
							<span className="ml-2 text-muted-foreground">desde el mes pasado</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Completadas</CardTitle>
						<div className="rounded-md bg-muted/50 p-1.5">
							<CheckCircle2 className="h-4 w-4 text-foreground/70" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold tracking-tight tabular-nums">
							{isLoading ? <Skeleton className="h-9 w-16" /> : '0'}
						</div>
						<div className="mt-2 flex items-center text-xs">
							<span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 font-medium text-success">
								<ArrowUpRight className="mr-0.5 h-3 w-3" />
								+18%
							</span>
							<span className="ml-2 text-muted-foreground">desde el mes pasado</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Usuarios Activos
						</CardTitle>
						<div className="rounded-md bg-muted/50 p-1.5">
							<Users className="h-4 w-4 text-foreground/70" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold tracking-tight tabular-nums">12</div>
						<div className="mt-2 flex items-center text-xs">
							<span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 font-medium text-success">
								<ArrowUpRight className="mr-0.5 h-3 w-3" />
								+19%
							</span>
							<span className="ml-2 text-muted-foreground">desde el mes pasado</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tasa de Conversión
						</CardTitle>
						<div className="rounded-md bg-muted/50 p-1.5">
							<TrendingUp className="h-4 w-4 text-foreground/70" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold tracking-tight tabular-nums">4.2%</div>
						<div className="mt-2 flex items-center text-xs">
							<span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 font-medium text-success">
								<ArrowUpRight className="mr-0.5 h-3 w-3" />
								+1.2%
							</span>
							<span className="ml-2 text-muted-foreground">desde el mes pasado</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
				{/* Chart Section */}
				<Card className="col-span-4 flex flex-col border-border/50 bg-card shadow-sm">
					<CardHeader className="border-b border-border/50 pb-4">
						<CardTitle className="text-lg font-medium">Actividad Anual</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col justify-end pt-6">
						<div className="relative h-[250px] w-full">
							{/* Y-axis lines */}
							<div className="absolute inset-0 flex flex-col justify-between">
								{['y-100', 'y-75', 'y-50', 'y-25', 'y-0'].map((id, i) => (
									<div key={id} className="flex w-full items-center gap-4">
										<span className="w-8 text-right font-mono text-[10px] text-muted-foreground/50">
											{100 - i * 25}
										</span>
										<div className="h-px flex-1 border-b border-dashed border-border/50" />
									</div>
								))}
							</div>

							{/* Bars */}
							<div className="absolute inset-0 left-12 flex items-end justify-between gap-2 pb-[1px]">
								{mockChartData.map((data) => (
									<div
										key={data.label}
										className="group relative flex w-full flex-col items-center justify-end"
										style={{ height: '100%' }}
									>
										{/* Tooltip */}
										<div className="absolute -top-8 hidden rounded-md border border-border/50 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block">
											{data.value}
										</div>
										{/* Bar */}
										<div
											className="w-full max-w-[2.5rem] rounded-t-md bg-gradient-to-t from-primary/10 to-primary/30 transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/50 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
											style={{ height: `${(data.value / maxValue) * 100}%` }}
										/>
										{/* Label */}
										<span className="absolute -bottom-6 font-mono text-[10px] text-muted-foreground">
											{data.label}
										</span>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Recent Activity Section */}
				<Card className="col-span-3 border-border/50 bg-card shadow-sm">
					<CardHeader className="border-b border-border/50 pb-4">
						<CardTitle className="text-lg font-medium">Últimas Tareas</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-2">
							{isLoading ? (
								['sk-1', 'sk-2', 'sk-3', 'sk-4'].map((id) => (
									<div key={id} className="flex items-center gap-4 rounded-lg p-3">
										<Skeleton className="h-8 w-8 rounded-full" />
										<div className="space-y-2">
											<Skeleton className="h-4 w-[180px]" />
											<Skeleton className="h-3 w-[100px]" />
										</div>
									</div>
								))
							) : todos?.data.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
										<ListTodo className="h-6 w-6 text-muted-foreground/50" />
									</div>
									<p className="mt-4 text-sm font-medium text-foreground">
										No hay tareas recientes
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Tus últimas actividades aparecerán aquí.
									</p>
								</div>
							) : (
								todos?.data.map((todo) => (
									<div
										key={todo.id}
										className="group -mx-3 flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30"
									>
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm">
											{todo.completed ? (
												<CheckCircle2 className="h-4 w-4 text-primary" />
											) : (
												<Clock className="h-4 w-4 text-muted-foreground/50" />
											)}
										</div>
										<div className="flex flex-1 flex-col gap-1">
											<div className="flex items-start justify-between gap-2">
												<p
													className={`text-sm font-medium leading-none tracking-tight ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}
												>
													{todo.title}
												</p>
												<span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
													{new Date(todo.createdAt).toLocaleDateString()}
												</span>
											</div>
											{todo.description && (
												<p className="line-clamp-1 text-xs text-muted-foreground">
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
			</div>
		</FadeIn>
	)
}
