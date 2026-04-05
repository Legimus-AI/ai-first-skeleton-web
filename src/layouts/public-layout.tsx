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
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
			{/* Subtle background effects (Aether style) */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

			{/* Centered Card */}
			<div className="relative z-10 w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-500">
				{/* Logo */}
				<div className="mb-8 flex flex-col items-center justify-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_24px_rgba(var(--primary),0.4)]">
						A
					</div>
					<span className="text-xl font-semibold tracking-tight text-foreground">App</span>
				</div>

				{/* Form Container */}
				<div className="rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5">
					<div className="mb-6 space-y-1.5 text-center">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-5">
						{socialLogin && (
							<>
								{socialLogin}
								<div className="relative my-6">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t border-border/50" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-card px-2 text-muted-foreground">
											o continuar con email
										</span>
									</div>
								</div>
							</>
						)}
						<div className="space-y-4">{children}</div>
						<div className="space-y-4 pt-2">{footer}</div>
					</form>
				</div>
			</div>
		</div>
	)
}
