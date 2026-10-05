import { Hint } from '@/ui/hint'

/** One-line notice for reference demos (board, chat, editor) whose data is never saved. */
export function DemoNotice({ className = '' }: { className?: string }) {
	return (
		<Hint className={className}>
			Ejemplo: nada se guarda en el servidor. Los datos viven solo en esta sesión del navegador y se
			pierden al salir de la página.
		</Hint>
	)
}
