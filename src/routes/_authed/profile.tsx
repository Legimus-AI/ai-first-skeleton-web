import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/slices/auth/components/profile-page'

export const Route = createFileRoute('/_authed/profile')({
	component: ProfileRoutePage,
})

function ProfileRoutePage() {
	return <ProfilePage />
}
