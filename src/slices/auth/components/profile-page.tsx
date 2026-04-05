import { Mail, Shield, User } from 'lucide-react'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { FadeIn } from '@/ui/fade-in'
import { Skeleton } from '@/ui/skeleton'
import { ProfileForm } from './profile-form'

export function ProfilePage() {
	const { data: user, isLoading } = useCurrentUser()

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-24 w-full rounded-xl" />
				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		)
	}

	if (!user) return null

	return (
		<FadeIn className="space-y-6">
			<CrudPageHeader
				title="Mi Perfil"
				description="Gestiona tu información personal y opciones de seguridad."
			/>

			{/* Header Section */}
			<div className="flex items-center gap-5 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
				<Avatar size="lg" name={user.name ?? user.email} className="h-16 w-16 text-lg" />
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{user.name || 'Usuario'}
					</h1>
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<Mail className="h-4 w-4" />
						{user.email}
					</p>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-4 w-4 text-primary" />
							Información Personal
						</CardTitle>
						<CardDescription>Actualiza tus datos y cómo te ven los demás.</CardDescription>
					</CardHeader>
					<CardContent>
						<ProfileForm user={user} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-4 w-4 text-primary" />
							Seguridad de la Cuenta
						</CardTitle>
						<CardDescription>Opciones de seguridad y acceso.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 p-4">
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-foreground">Contraseña</p>
								<p className="text-xs text-muted-foreground">Gestiona tu contraseña de acceso</p>
							</div>
							<Button variant="outline" size="sm">
								Cambiar
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</FadeIn>
	)
}
