import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export const Route = createFileRoute('/_authed/settings/notifications')({
	component: SettingsNotificationsPage,
})

function SettingsNotificationsPage() {
	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Notification Preferences</h1>
				<p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Email Notifications</CardTitle>
					<CardDescription>Receive daily digests and important alerts.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2">
						<input type="checkbox" id="emails" className="rounded border-input" defaultChecked />
						<label
							htmlFor="emails"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Enable email notifications
						</label>
					</div>
					<Button className="mt-4">Save Preferences</Button>
				</CardContent>
			</Card>
		</div>
	)
}
