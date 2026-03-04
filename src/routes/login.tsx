import { zodResolver } from '@hookform/resolvers/zod'
import { type Login, loginSchema } from '@repo/shared'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { AuthPageLayout } from '@/slices/auth/components/auth-page-layout'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { useLogin } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'

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
		<AuthPageLayout
			title="Login"
			description="Sign in to your account"
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton />}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={login.isPending}>
						{login.isPending ? 'Signing in...' : 'Sign in'}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{' '}
						<Link to="/register" className="text-primary underline-offset-4 hover:underline">
							Register
						</Link>
					</p>
				</>
			}
		>
			<AuthFormField
				id="email"
				label="Email"
				type="email"
				placeholder="user@example.com"
				registration={register('email')}
				hasError={!!errors.email}
				errorMessage={errors.email?.message}
				autoComplete="email"
			/>
			<AuthFormField
				id="password"
				label="Password"
				type="password"
				placeholder="Enter your password"
				registration={register('password')}
				hasError={!!errors.password}
				errorMessage={errors.password?.message}
				autoComplete="current-password"
			/>
		</AuthPageLayout>
	)
}
