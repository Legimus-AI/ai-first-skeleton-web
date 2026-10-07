import { createFileRoute } from '@tanstack/react-router'
import { DeviceApprovalPage } from '@/slices/auth/components/device-approval-page'
import { DeviceCodeForm } from '@/slices/auth/components/device-code-form'

/** Better Auth's OAuth device grant (`verificationUri`): the CLI prints `/device?user_code=…`. */
export const Route = createFileRoute('/_session/device')({
	validateSearch: (search: Record<string, unknown>): { user_code?: string } => {
		// WHY: the router reads an all-digit code as a number.
		const userCode = String(search.user_code ?? '').trim()
		return userCode ? { user_code: userCode } : {}
	},
	component: DeviceRoute,
})

function DeviceRoute() {
	const { user_code: userCode } = Route.useSearch()
	const navigate = Route.useNavigate()
	if (!userCode) {
		return <DeviceCodeForm onSubmit={(code) => void navigate({ search: { user_code: code } })} />
	}
	return (
		<DeviceApprovalPage userCode={userCode} onChangeCode={() => void navigate({ search: {} })} />
	)
}
