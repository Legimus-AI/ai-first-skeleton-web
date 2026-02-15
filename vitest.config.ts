import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'json-summary'],
			reportsDirectory: './coverage',
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			exclude: ['src/**/__tests__/**', 'src/main.tsx', 'src/routeTree.gen.ts', 'src/ui/**'],
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
})
