import { zodResolver } from '@hookform/resolvers/zod'
import { type Register, registerSchema } from '@repo/shared'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { AuthFormField } from '@/slices/auth/components/auth-form-field'
import { AuthPageLayout } from '@/slices/auth/components/auth-page-layout'
import { GoogleOAuthButton } from '@/slices/auth/components/google-oauth-button'
import { useRegister } from '@/slices/auth/hooks/use-auth'
import { Button } from '@/ui/button'

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
		<AuthPageLayout
			title="Register"
			description="Create a new account"
			onSubmit={handleSubmit(onSubmit)}
			socialLogin={<GoogleOAuthButton />}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={registerMutation.isPending}>
						{registerMutation.isPending ? 'Creating account...' : 'Create account'}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link to="/login" className="text-primary underline-offset-4 hover:underline">
							Login
						</Link>
					</p>
				</>
			}
		>
			<AuthFormField
				id="name"
				label="Name"
				type="text"
				placeholder="Your full name"
				registration={register('name')}
				hasError={!!errors.name}
				errorMessage={errors.name?.message}
				autoComplete="name"
			/>
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
				placeholder="Min 8 characters"
				registration={register('password')}
				hasError={!!errors.password}
				errorMessage={errors.password?.message}
				autoComplete="new-password"
			/>
		</AuthPageLayout>
	)
}
