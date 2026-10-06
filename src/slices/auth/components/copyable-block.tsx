import { copyToClipboard } from '@/services/clipboard-service'
import { Button } from '@/ui/button'

interface CopyableBlockProps {
	/** Names the copied thing in the button's accessible name ("Copiar <label>"). */
	label: string
	text: string
}

export function CopyableBlock({ label, text }: CopyableBlockProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-start">
			<pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-control border border-border bg-background p-3 font-mono text-xs text-foreground">
				{text}
			</pre>
			<Button
				type="button"
				variant="secondary"
				className="self-end sm:self-auto"
				aria-label={`Copiar ${label}`}
				onClick={() => void copyToClipboard(text)}
			>
				Copiar
			</Button>
		</div>
	)
}
