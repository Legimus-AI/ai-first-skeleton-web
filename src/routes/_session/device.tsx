import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DeviceApprovalPage } from '@/slices/auth/components/device-approval-page'
import { DeviceCodeForm } from '@/slices/auth/components/device-code-form'

/**
 * Better Auth's OAuth device grant: the person types the code their terminal shows.
 * WHY: the code is never read from the URL. A link carrying `?user_code=` would let an attacker
 * who started the login have the victim approve it with one click; the typed code is state, not URL.
 */
export const Route = createFileRoute('/_session/device')({
	component: DeviceRoute,
})

function DeviceRoute() {
	const [userCode, setUserCode] = useState<string | undefined>()
	if (!userCode) return <DeviceCodeForm onSubmit={setUserCode} />
	return <DeviceApprovalPage userCode={userCode} onChangeCode={() => setUserCode(undefined)} />
}
