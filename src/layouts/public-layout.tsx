import type { FormEvent, ReactNode } from 'react'

// ─── Public Layout ───────────────────────────────────────────────────────────
// Centered card for pages outside the app shell: login, register, password reset, and the
// OAuth consent, CLI approval and invitation pages.

interface PublicLayoutProps {
	title: string
	description: ReactNode
	children: ReactNode
	/** Actions under the content; inside the form when there is one. */
	footer?: ReactNode
	/**
	 * Makes the card a form; the layout prevents the page reload before calling it. Without it the
	 * card only shows content (a status, a skeleton).
	 */
	onSubmit?: (event: FormEvent<HTMLFormElement>) => void
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
	const body = (
		<>
			{socialLogin}
			<div className="space-y-4">{children}</div>
			{footer && <div className="space-y-4 pt-2">{footer}</div>}
		</>
	)
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

				<div className="rounded-surface bg-card p-8 shadow-surface">
					<div className="mb-6 space-y-1.5 text-center">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground break-words">
							{title}
						</h1>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					{onSubmit ? (
						<form
							onSubmit={(event) => {
								event.preventDefault()
								onSubmit(event)
							}}
							className="space-y-5"
						>
							{body}
						</form>
					) : (
						<div className="space-y-5">{body}</div>
					)}
				</div>
			</div>
		</div>
	)
}
