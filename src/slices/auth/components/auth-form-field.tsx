import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
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
	errorMessage?: string | undefined
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
	const [showPassword, setShowPassword] = useState(false)
	const isPassword = type === 'password'
	const inputType = isPassword && showPassword ? 'text' : type

	const errorId = `${id}-error`

	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="text-sm font-medium text-foreground">
				{label}
			</label>
			<div className="relative">
				<Input
					{...registration}
					id={id}
					type={inputType}
					placeholder={placeholder}
					error={hasError}
					autoComplete={autoComplete}
					aria-describedby={hasError && errorMessage ? errorId : undefined}
					className={cn('aether-input-inset', isPassword && 'pr-10')}
				/>
				{isPassword && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
						onClick={() => setShowPassword((v) => !v)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						tabIndex={-1}
					>
						{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</Button>
				)}
			</div>
			{hasError && errorMessage && (
				<p id={errorId} className="text-xs text-destructive" role="alert">
					{errorMessage}
				</p>
			)}
		</div>
	)
}
