/** What the auth forms check before Better Auth sees them, built from the shared user schema. */
import { newPasswordSchema, userSchema } from '@repo/shared'
import { z } from 'zod'

export const loginFormSchema = userSchema
	.pick({ email: true })
	.extend({ password: z.string().min(1) })
export type LoginForm = z.infer<typeof loginFormSchema>

export const registerFormSchema = userSchema
	.pick({ name: true, email: true })
	.extend({ password: newPasswordSchema })
export type RegisterForm = z.infer<typeof registerFormSchema>

export const emailFormSchema = userSchema.pick({ email: true })
export type EmailForm = z.infer<typeof emailFormSchema>

export const newPasswordFormSchema = registerFormSchema.pick({ password: true })
export type NewPasswordForm = z.infer<typeof newPasswordFormSchema>
