import { Loader2, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Input } from '@/ui/input'

interface SearchInputProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	isLoading?: boolean
}

export function SearchInput({
	value,
	onChange,
	placeholder = 'Search...',
	className,
	isLoading,
}: SearchInputProps) {
	const [internal, setInternal] = useState(value)
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => {
		setInternal(value)
	}, [value])

	const handleChange = (next: string) => {
		setInternal(next)
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => onChange(next), 600)
	}

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [])

	return (
		<div className={cn('relative w-full sm:w-auto', className)}>
			{isLoading ? (
				<Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
			) : (
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			)}
			<Input
				value={internal}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={placeholder}
				className="w-full pl-9 pr-8 sm:w-64"
				aria-label={placeholder}
			/>
			{internal.length > 0 && (
				<button
					type="button"
					onClick={() => handleChange('')}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Clear search"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	)
}
