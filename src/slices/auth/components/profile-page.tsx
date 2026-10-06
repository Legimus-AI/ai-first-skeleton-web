import { Link } from '@tanstack/react-router'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Avatar } from '@/ui/avatar'
import { buttonVariants } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { CrudPageHeader } from '@/ui/crud-page-header'
import { FadeIn } from '@/ui/fade-in'
import { Mail, Shield, User } from '@/ui/icons'
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
			<div className="flex items-center gap-5 rounded-surface bg-card p-(--surface-padding) shadow-surface">
				<Avatar size="lg" name={user.name ?? user.email} className="h-16 w-16 text-lg" />
				<div className="min-w-0 space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground break-words">
						{user.name || 'Usuario'}
					</h2>
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<Mail className="h-4 w-4 shrink-0" />
						<span className="min-w-0 break-all">{user.email}</span>
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
								<p className="text-xs text-muted-foreground">
									Te enviaremos un enlace a tu email para crear una nueva.
								</p>
							</div>
							<Link
								to="/forgot-password"
								className={buttonVariants({ variant: 'outline', size: 'sm' })}
							>
								Cambiar
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</FadeIn>
	)
}
