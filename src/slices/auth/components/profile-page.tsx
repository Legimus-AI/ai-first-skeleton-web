import { User } from 'lucide-react'
import { useCurrentUser } from '@/slices/auth/hooks/use-auth'
import { Avatar } from '@/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { ProfileForm } from './profile-form'

export function ProfilePage() {
	const { data: user, isLoading } = useCurrentUser()

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	if (!user) return null

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Avatar size="lg" fallback={user.email.charAt(0).toUpperCase()} />
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Account Information
					</CardTitle>
					<CardDescription>Update your profile details.</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileForm user={user} />
				</CardContent>
			</Card>
		</div>
	)
}
