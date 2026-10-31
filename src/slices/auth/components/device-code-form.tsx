import { useState } from 'react'
import { PublicLayout } from '@/layouts/public-layout'
import { Button } from '@/ui/button'
import { Hint } from '@/ui/hint'
import { Input } from '@/ui/input'

interface DeviceCodeFormProps {
	/** The code as typed (trimmed, upper case); the page puts it in the URL. */
	onSubmit: (userCode: string) => void
}

/** The CLI login's first step: the person types what their terminal shows (the link never carries it). */
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
			<Hint variant="warning">
				Aprueba solo un código que tú iniciaste desde tu propia terminal. Si alguien más te lo envió
				o te pidió escribirlo, no lo uses: te daría acceso a tu cuenta.
			</Hint>
		</PublicLayout>
	)
}
