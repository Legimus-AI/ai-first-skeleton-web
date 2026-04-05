import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

export const Route = createFileRoute('/_authed/settings/general')({
	component: SettingsGeneralPage,
})

function SettingsGeneralPage() {
	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">General Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your workspace general configuration.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Workspace Name</CardTitle>
					<CardDescription>This is your workspace's visible name within Legimus.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="workspace-name" className="text-sm font-medium text-foreground">
							Name
						</label>
						<Input id="workspace-name" defaultValue="Legimus Workspace v1.0" />
					</div>
					<Button>Save Changes</Button>
				</CardContent>
			</Card>
		</div>
	)
}
