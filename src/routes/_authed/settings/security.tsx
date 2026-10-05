import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export const Route = createFileRoute('/_authed/settings/security')({
	component: SettingsSecurityPage,
})

function SettingsSecurityPage() {
	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Seguridad</h1>
				<p className="text-sm text-muted-foreground">Cómo proteges el acceso a tu cuenta.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Contraseña</CardTitle>
					<CardDescription>
						Te enviaremos un enlace a tu email para crear una contraseña nueva.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Link to="/forgot-password" className={buttonVariants({ variant: 'outline' })}>
						Cambiar contraseña
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}
