import { ApiKeysPage } from '@/slices/auth/components/api-keys-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/api-keys')({
	component: ApiKeysRoutePage,
})

function ApiKeysRoutePage() {
	return (
		<div className="min-h-screen bg-background px-4 py-12">
			<div className="mx-auto max-w-lg">
				<ApiKeysPage />
			</div>
		</div>
	)
}
