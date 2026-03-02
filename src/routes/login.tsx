import { zodResolver } from '@hookform/resolvers/zod'
import { type Login, loginSchema } from '@repo/shared'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useLogin } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

export const Route = createFileRoute('/login')({
	component: LoginPage,
})

function LoginPage() {
	const login = useLogin()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Login>({
		resolver: zodResolver(loginSchema),
	})

	const onSubmit = (data: Login) => login.mutate(data)

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
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
							{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
						</div>
						<div className="space-y-1">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								{...register('password')}
								id="password"
								type="password"
								placeholder="Enter your password"
								error={!!errors.password}
								autoComplete="current-password"
							/>
							{errors.password && (
								<p className="text-xs text-destructive">{errors.password.message}</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button type="submit" className="w-full" disabled={login.isPending}>
							{login.isPending ? 'Signing in...' : 'Sign in'}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{' '}
							<Link to="/register" className="text-primary underline-offset-4 hover:underline">
								Register
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
