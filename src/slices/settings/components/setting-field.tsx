import type { ReactNode } from 'react'
import { Button } from '@/ui/button'

interface RestoreDefault {
	/** Accessible name, e.g. "Restablecer la zona horaria". */
	label: string
	disabled: boolean
	onClick: () => void
}

interface SettingFieldProps {
	/** The control's id, so the label names it. */
	htmlFor: string
	label: string
	/** Help under the control. */
	description?: string
	error?: string | undefined
	/** Id of more text about the control, e.g. why it is read-only. */
	describedBy?: string | undefined
	/** Shows "Restablecer" next to the label: the field holds a value other than its default. */
	restoreDefault?: RestoreDefault | undefined
	/** Renders the control; it must pass `ariaDescribedBy` on as `aria-describedby`. */
	children: (ariaDescribedBy: string | undefined) => ReactNode
}

/** One settings field: label (and "Restablecer"), control, help and error. */
export function SettingField({
	htmlFor,
	label,
	description,
	error,
	describedBy,
	restoreDefault,
	children,
}: SettingFieldProps) {
	const descriptionId = `${htmlFor}-description`
	const errorId = `${htmlFor}-error`
	const ariaDescribedBy =
		[description && descriptionId, error && errorId, describedBy].filter(Boolean).join(' ') ||
		undefined
	return (
		<div className="space-y-2">
			<div className="flex min-h-8 items-center justify-between gap-2">
				<label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
					{label}
				</label>
				{restoreDefault && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="min-h-11 sm:min-h-8"
						disabled={restoreDefault.disabled}
						onClick={restoreDefault.onClick}
						aria-label={restoreDefault.label}
					>
						Restablecer
					</Button>
				)}
			</div>
			{children(ariaDescribedBy)}
			{description && (
				<p id={descriptionId} className="text-xs text-muted-foreground">
					{description}
				</p>
			)}
			{error && (
				<p id={errorId} className="text-xs text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}
