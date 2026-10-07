import { useState } from 'react'
import { PublicLayout } from '@/layouts/public-layout'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

interface DeviceCodeFormProps {
	/** The code as typed (trimmed, upper case); the page puts it in the URL. */
	onSubmit: (userCode: string) => void
}

/** For a CLI login opened without its code in the link: the person types what the terminal shows. */
export function DeviceCodeForm({ onSubmit }: DeviceCodeFormProps) {
	const [code, setCode] = useState('')
	const userCode = code.trim().toUpperCase()

	const submit = () => {
		if (userCode) onSubmit(userCode)
	}

	return (
		<PublicLayout
			title="Conecta tu terminal"
			description="Escribe el código que muestra tu terminal."
			onSubmit={submit}
			footer={
				<Button type="submit" className="w-full" disabled={!userCode}>
					Continuar
				</Button>
			}
		>
			<div className="space-y-1.5">
				<label htmlFor="user-code" className="text-sm font-medium text-foreground">
					Código
				</label>
				<Input
					id="user-code"
					value={code}
					onChange={(event) => setCode(event.target.value)}
					placeholder="ABCD-EFGH"
					autoComplete="one-time-code"
					autoCapitalize="characters"
					spellCheck={false}
					className="font-mono uppercase tracking-widest"
				/>
			</div>
		</PublicLayout>
	)
}
