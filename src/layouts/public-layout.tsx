import type { ReactNode } from 'react'

// ─── Public Layout ───────────────────────────────────────────────────────────
// Centered card for unauthenticated pages (login, register, password reset).

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
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-[380px] motion-safe:animate-fade-in">
				{/* Logo */}
				<div className="mb-8 flex flex-col items-center justify-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
						A
					</div>
					<span className="text-xl font-semibold tracking-tight text-foreground">App</span>
				</div>

				{/* Form Container */}
				<div className="rounded-surface bg-card p-8 shadow-surface">
					<div className="mb-6 space-y-1.5 text-center">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-5">
						{socialLogin}
						<div className="space-y-4">{children}</div>
						<div className="space-y-4 pt-2">{footer}</div>
					</form>
				</div>
			</div>
		</div>
	)
}
