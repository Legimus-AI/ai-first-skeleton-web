import { Link } from '@tanstack/react-router'
import { cn } from '@/utils/cn'

// App wordmark + badge shared by the header shells (focused, split, navbar) so
// they stop hardcoding — and drifting on — the badge scale. `size` covers the
// two scales the shells used: sm (compact headers) and md (primary navbar).
const sizeClasses = {
	sm: { badge: 'h-6 w-6 rounded-md text-[10px]', text: 'text-sm' },
	md: { badge: 'h-7 w-7 rounded-lg text-xs', text: 'text-base' },
} as const

export function AppLogo({ size = 'sm' }: { size?: keyof typeof sizeClasses }) {
	const scale = sizeClasses[size]
	return (
		<Link
			to="/"
			className={cn(
				'flex items-center gap-2 font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary',
				scale.text,
			)}
		>
			<div
				className={cn(
					'flex shrink-0 items-center justify-center bg-primary font-bold text-primary-foreground',
					scale.badge,
				)}
			>
				A
			</div>
			<span className="hidden sm:inline">App</span>
		</Link>
	)
}
