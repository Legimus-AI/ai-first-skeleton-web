import { toast } from 'sonner'

/** Copies text and tells the user whether it worked (the clipboard can be blocked). */
export async function copyToClipboard(text: string, successMessage = 'Copiado al portapapeles') {
	try {
		await navigator.clipboard.writeText(text)
		toast.success(successMessage)
	} catch {
		toast.error('No se pudo copiar', {
			description: 'Tu navegador bloqueó el portapapeles. Selecciona el texto y cópialo a mano.',
		})
	}
}
