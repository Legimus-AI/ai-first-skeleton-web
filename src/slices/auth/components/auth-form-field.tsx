import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/ui/input'

interface AuthFormFieldProps {
	/** Unique field identifier, used for htmlFor/id linking. */
	id: string
	/** Visible label text. */
	label: string
	/** HTML input type (e.g. "email", "password", "text"). */
	type: string
	/** Placeholder text shown when the field is empty. */
	placeholder: string
	/** react-hook-form register return value (spread onto the input). */
	registration: UseFormRegisterReturn
	/** Whether the field has a validation error. */
	hasError: boolean
	/** Validation error message to display below the input. */
	errorMessage?: string
	/** HTML autocomplete attribute for browser autofill. */
	autoComplete?: string
}

export function AuthFormField({
	id,
	label,
	type,
	placeholder,
	registration,
	hasError,
	errorMessage,
	autoComplete,
}: AuthFormFieldProps) {
	return (
		<div className="space-y-1">
			<label htmlFor={id} className="text-sm font-medium">
				{label}
			</label>
			<Input
				{...registration}
				id={id}
				type={type}
				placeholder={placeholder}
				error={hasError}
				autoComplete={autoComplete}
			/>
			{hasError && errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
		</div>
	)
}
