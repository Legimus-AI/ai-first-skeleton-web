import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { ArrowLeft, Home } from '@/ui/icons'

export function NotFound() {
	const navigate = useNavigate()
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
			<div className="motion-safe:animate-fade-in">
				<h1 className="select-none text-8xl font-semibold leading-none text-muted-foreground/40 sm:text-9xl">
					404
				</h1>

				<div className="mt-4 space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						Página no encontrada
					</h2>
					<p className="mx-auto max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
						Te has adentrado en territorio desconocido. La página que buscas no existe o ha sido
						movida a otra dimensión.
					</p>
				</div>

				<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
					<Button
						size="lg"
						className="w-full sm:w-auto min-w-[180px]"
						onClick={() => navigate({ to: '/' })}
					>
						<Home className="mr-2 h-4 w-4" />
						Volver al inicio
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="w-full sm:w-auto min-w-[180px]"
						onClick={() => window.history.back()}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Regresar
					</Button>
				</div>
			</div>
		</div>
	)
}
