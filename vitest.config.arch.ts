import { defineConfig } from 'vitest/config'

// Standalone config for the architecture test ONLY.
// architecture.test.ts is pure node:fs + regex — no @repo/shared, no React, no
// jsdom — so it can run in this repo's own CI via `npx vitest` WITHOUT the full
// workspace install that the component/hook tests require (see .github/workflows/ci.yml).
export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/__tests__/architecture.test.ts'],
	},
})
