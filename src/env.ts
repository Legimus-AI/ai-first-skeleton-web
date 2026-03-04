/// <reference types="vite/client" />
import { z } from 'zod'

const envSchema = z.object({
	VITE_API_URL: z.string().url().optional(),
	VITE_LOCALE: z.string().default('en-US'),
	VITE_GOOGLE_AUTH: z
		.string()
		.transform((v) => v === 'true')
		.default('false'),
})

export type Env = z.infer<typeof envSchema>

export function getEnv(): Env {
	return envSchema.parse(import.meta.env)
}

export const locale = getEnv().VITE_LOCALE
