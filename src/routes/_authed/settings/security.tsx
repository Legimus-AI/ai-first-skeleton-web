import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export const Route = createFileRoute('/_authed/settings/security')({
	component: SettingsSecurityPage,
})

function SettingsSecurityPage() {
	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Security Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your account security and authentication methods.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>Add an extra layer of security to your account.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline">Enable 2FA</Button>
				</CardContent>
			</Card>
		</div>
	)
}
