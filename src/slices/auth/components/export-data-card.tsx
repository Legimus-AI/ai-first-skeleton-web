import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { useExportMyData } from '../hooks/use-account'

export function ExportDataCard() {
	const exportMyData = useExportMyData()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tus datos</CardTitle>
				<CardDescription>
					Descarga una copia de tus datos personales: perfil, membresía, sesiones, claves y apps
					conectadas, avisos y registro de actividad.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					type="button"
					variant="outline"
					loading={exportMyData.isPending}
					onClick={() => exportMyData.mutate()}
				>
					Descargar mis datos
				</Button>
			</CardContent>
		</Card>
	)
}
