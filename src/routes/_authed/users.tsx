import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'

export const Route = createFileRoute('/_authed/users')({
	component: UsersPage,
})

function UsersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
				<p className="text-sm text-muted-foreground">Gestiona los usuarios de tu organizacion.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Directorio de Usuarios</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<CheckCircle2 className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="mt-4 text-sm font-medium">No hay usuarios adicionales aun.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
