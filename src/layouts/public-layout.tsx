import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'

// ─── Public Layout ───────────────────────────────────────────────────────────
// Centered card layout for unauthenticated pages (login, register, etc.).
// Moved from slices/auth/components/auth-page-layout.tsx → layouts/public-layout.tsx
// so all layout shells live in one canonical place.

interface PublicLayoutProps {
	/** Page title shown in the card header. */
	title: string
	/** Subtitle shown below the title. */
	description: string
	/** Form fields rendered inside CardContent. */
	children: ReactNode
	/** Footer content (submit button + navigation link). */
	footer: ReactNode
	/** Form submit handler. */
	onSubmit: () => void
	/** Optional social login buttons rendered above the form fields. */
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
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<form onSubmit={onSubmit}>
					<CardContent className="space-y-4">
						{socialLogin}
						{children}
					</CardContent>
					<CardFooter className="flex flex-col gap-3">{footer}</CardFooter>
				</form>
			</Card>
		</div>
	)
}
