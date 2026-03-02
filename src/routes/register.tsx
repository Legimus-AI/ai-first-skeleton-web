import { useRegister } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Register, registerSchema } from '@repo/shared'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

export const Route = createFileRoute('/register')({
	component: RegisterPage,
})

function RegisterPage() {
	const registerMutation = useRegister()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Register>({
		resolver: zodResolver(registerSchema),
	})

	const onSubmit = (data: Register) => registerMutation.mutate(data)

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Register</CardTitle>
					<CardDescription>Create a new account</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<div className="space-y-1">
							<label htmlFor="name" className="text-sm font-medium">
								Name
							</label>
							<Input
								{...register('name')}
								id="name"
								type="text"
								placeholder="Your full name"
								error={!!errors.name}
								autoComplete="name"
							/>
							{errors.name && (
								<p className="text-xs text-destructive">{errors.name.message}</p>
							)}
						</div>
						<div className="space-y-1">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<Input
								{...register('email')}
								id="email"
								type="email"
								placeholder="user@example.com"
								error={!!errors.email}
								autoComplete="email"
							/>
							{errors.email && (
								<p className="text-xs text-destructive">{errors.email.message}</p>
							)}
						</div>
						<div className="space-y-1">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								{...register('password')}
								id="password"
								type="password"
								placeholder="Min 8 characters"
								error={!!errors.password}
								autoComplete="new-password"
							/>
							{errors.password && (
								<p className="text-xs text-destructive">{errors.password.message}</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button type="submit" className="w-full" disabled={registerMutation.isPending}>
							{registerMutation.isPending ? 'Creating account...' : 'Create account'}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link to="/login" className="text-primary underline-offset-4 hover:underline">
								Login
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
