import { createFileRoute } from '@tanstack/react-router'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { FadeIn } from '@/ui/fade-in'
import { Switch } from '@/ui/switch'

export const Route = createFileRoute('/_authed/settings/notifications')({
	component: SettingsNotificationsPage,
})

function SettingsNotificationsPage() {
	return (
		<FadeIn className="space-y-6 max-w-3xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">Notificaciones</h1>
				<p className="text-sm text-muted-foreground">
					Configura cómo y cuándo quieres recibir actualizaciones de la plataforma.
				</p>
			</div>

			<div className="space-y-6">
				<Card className="border-border/50 bg-card shadow-sm">
					<CardHeader className="border-b border-border/50 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg font-medium">
							<Smartphone className="h-5 w-5 text-primary" />
							Notificaciones Push
						</CardTitle>
						<CardDescription>
							Alertas en tiempo real directamente en tu navegador o dispositivo móvil.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-6">
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Menciones directas</p>
									<p className="text-xs text-muted-foreground">
										Cuando alguien te etiqueta en un comentario o tarea.
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Asignación de tareas</p>
									<p className="text-xs text-muted-foreground">
										Cuando se te asigna una nueva responsabilidad.
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Alertas de sistema</p>
									<p className="text-xs text-muted-foreground">
										Mantenimientos programados y actualizaciones de estado.
									</p>
								</div>
								<Switch />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card shadow-sm">
					<CardHeader className="border-b border-border/50 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg font-medium">
							<Mail className="h-5 w-5 text-primary" />
							Correos Electrónicos
						</CardTitle>
						<CardDescription>
							Resúmenes y alertas enviadas a tu bandeja de entrada.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-6">
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Resumen semanal</p>
									<p className="text-xs text-muted-foreground">
										Un reporte con la actividad de tu equipo cada lunes.
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Nuevos inicios de sesión</p>
									<p className="text-xs text-muted-foreground">
										Alertas de seguridad cuando se detecta un dispositivo nuevo (Obligatorio).
									</p>
								</div>
								<Switch checked disabled />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card shadow-sm">
					<CardHeader className="border-b border-border/50 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg font-medium">
							<MessageSquare className="h-5 w-5 text-primary" />
							Marketing y Producto
						</CardTitle>
						<CardDescription>
							Novedades sobre la plataforma y ofertas especiales.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-6">
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Actualizaciones de producto</p>
									<p className="text-xs text-muted-foreground">
										Nuevas funcionalidades, mejoras y changelogs.
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-0.5">
									<p className="text-sm font-medium text-foreground">Ofertas y promociones</p>
									<p className="text-xs text-muted-foreground">
										Descuentos exclusivos y eventos especiales.
									</p>
								</div>
								<Switch />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</FadeIn>
	)
}
