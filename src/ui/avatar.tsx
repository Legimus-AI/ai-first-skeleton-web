import { cn } from '@/lib/cn'

interface AvatarProps {
	name: string
	src?: string
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

const sizes = {
	sm: 'h-6 w-6 text-[10px]',
	md: 'h-8 w-8 text-xs',
	lg: 'h-10 w-10 text-sm',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	if (src) {
		return (
			<img
				src={src}
				alt={name}
				className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
			/>
		)
	}

	return (
		<span
			className={cn(
				'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
				sizes[size],
				className,
			)}
			title={name}
		>
			{initials}
		</span>
	)
}
