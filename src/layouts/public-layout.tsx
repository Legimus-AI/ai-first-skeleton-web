import type { ReactNode } from 'react'

// ─── Public Layout ───────────────────────────────────────────────────────────
// Split-screen gradient layout for unauthenticated pages (login, register).
// Left: brand gradient with tagline. Right: centered form.
// Mobile: stacks vertically (gradient on top, form below).

interface PublicLayoutProps {
	title: string
	description: string
	children: ReactNode
	footer: ReactNode
	onSubmit: () => void
	socialLogin?: ReactNode
}

export function PublicLayout({
	title,
	description,
	children,
	footer,
	onSubmit,
	socialLogin,
}: PublicLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			{/* Brand panel — gradient */}
			<div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-background px-8 py-16 lg:w-1/2 lg:py-0">
				{/* Decorative blurred circles */}
				<div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
				<div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

				<div className="relative z-10 max-w-md text-center">
					<div className="mb-6 flex items-center justify-center gap-2.5">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground text-sm font-bold text-primary">
							A
						</div>
						<span className="text-2xl font-semibold tracking-tight text-primary-foreground">
							App
						</span>
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-primary-foreground lg:text-3xl">
						Tu plataforma inteligente
					</h2>
					<p className="mt-3 text-sm text-primary-foreground/70 lg:text-base">
						Automatiza, gestiona y escala tu negocio con inteligencia artificial.
					</p>
				</div>
			</div>

			{/* Form panel */}
			<div className="flex flex-1 items-center justify-center bg-background px-4 py-12 lg:px-8">
				<div className="w-full max-w-sm space-y-6">
					<div className="space-y-1.5">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-4">
						{socialLogin && (
							<>
								{socialLogin}
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t border-border" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-background px-2 text-muted-foreground">o</span>
									</div>
								</div>
							</>
						)}
						<div className="space-y-4">{children}</div>
						<div className="space-y-3 pt-2">{footer}</div>
					</form>
				</div>
			</div>
		</div>
	)
}
