import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, ListTodo, TrendingUp, Users } from 'lucide-react'
import { useTodos } from '@/slices/todos/hooks/use-todos'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'

export const Route = createFileRoute('/_authed/dashboard')({
	component: DashboardPage,
})

function DashboardPage() {
	const { data: todos, isLoading } = useTodos({ limit: 5 })

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					Bienvenido de vuelta. Aqui tienes un resumen de tu actividad.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tareas Totales</CardTitle>
						<ListTodo className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? <Skeleton className="h-8 w-12" /> : (todos?.meta.total ?? 0)}
						</div>
						<p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completadas</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? <Skeleton className="h-8 w-12" /> : '0'}
						</div>
						<p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">+19% desde el mes pasado</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tasa de Conversion</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">4.2%</div>
						<p className="text-xs text-muted-foreground">+1.2% desde el mes pasado</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Actividad Reciente</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
							Grafico de actividad aqui
						</div>
					</CardContent>
				</Card>
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Ultimas Tareas</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{isLoading ? (
								['sk-1', 'sk-2', 'sk-3'].map((id) => (
									<div key={id} className="flex items-center gap-4">
										<Skeleton className="h-9 w-9 rounded-full" />
										<div className="space-y-1">
											<Skeleton className="h-4 w-[150px]" />
											<Skeleton className="h-3 w-[100px]" />
										</div>
									</div>
								))
							) : todos?.data.length === 0 ? (
								<p className="text-sm text-muted-foreground">No hay tareas recientes.</p>
							) : (
								todos?.data.map((todo) => (
									<div key={todo.id} className="flex items-center">
										<div className="ml-4 space-y-1">
											<p className="text-sm font-medium leading-none">{todo.title}</p>
											<p className="text-sm text-muted-foreground">
												{todo.completed ? 'Completada' : 'Pendiente'}
											</p>
										</div>
										<div className="ml-auto font-medium">
											<span className="text-xs text-muted-foreground">
												{new Date(todo.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
