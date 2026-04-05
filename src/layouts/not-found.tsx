import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/ui/button'

export function NotFound() {
	const navigate = useNavigate()
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center selection:bg-primary selection:text-primary-foreground">
			{/* Subtle background effects (Aether style) */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

			<div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
				{/* Huge glowing 404 */}
				<div className="relative flex justify-center">
					<h1 className="text-[10rem] sm:text-[14rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/5 drop-shadow-sm select-none">
						404
					</h1>
					{/* Decorative floating elements */}
					<div className="absolute top-[20%] left-[20%] h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
					<div
						className="absolute bottom-[30%] right-[20%] h-3 w-3 rounded-full bg-primary/50 animate-bounce shadow-[0_0_12px_rgba(var(--primary),0.5)]"
						style={{ animationDuration: '3s' }}
					/>
				</div>

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
						className="w-full sm:w-auto min-w-[180px] shadow-[0_0_24px_rgba(var(--primary),0.2)]"
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
