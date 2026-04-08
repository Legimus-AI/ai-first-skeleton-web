/**
 * Architecture rule tests — enforces INVARIANTS.md as code.
 *
 * Static analysis: scans source files and verifies structural rules.
 * NO browser, NO network — just file system reads and regex patterns.
 * Runs in < 1 second.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_DIR = join(__dirname, '..')
const SLICES_DIR = join(SRC_DIR, 'slices')

/**
 * Recursively collect files matching extensions in a directory.
 */
function collectFiles(
	dir: string,
	extensions: string[],
	excludeDirs: string[] = ['node_modules', '__tests__'],
): string[] {
	const results: string[] = []
	let entries: string[]
	try {
		entries = readdirSync(dir)
	} catch {
		return results
	}
	for (const entry of entries) {
		const fullPath = join(dir, entry)
		const stat = statSync(fullPath)
		if (stat.isDirectory()) {
			if (excludeDirs.includes(entry)) continue
			results.push(...collectFiles(fullPath, extensions, excludeDirs))
		} else if (extensions.some((ext) => entry.endsWith(ext))) {
			results.push(fullPath)
		}
	}
	return results
}

/**
 * Get all slice directories.
 */
function getSliceNames(): string[] {
	try {
		return readdirSync(SLICES_DIR).filter((name) => {
			const stat = statSync(join(SLICES_DIR, name))
			return stat.isDirectory()
		})
	} catch {
		return []
	}
}

// Infrastructure slices — not standard CRUD, exempt from CRUD-specific checks (INV-050)
// team: manages users table (under settings), needs auth cross-import for currentUser
const INFRA_SLICES = new Set(['auth', 'team'])

function getCrudSliceNames(): string[] {
	return getSliceNames().filter((name) => !INFRA_SLICES.has(name))
}

describe('Architecture rules (INVARIANTS.md)', () => {
	const allTsxFiles = collectFiles(SRC_DIR, ['.tsx'])
	const allTsFiles = collectFiles(SRC_DIR, ['.ts', '.tsx'])

	// --- INVARIANT #10: No CSS files ---

	it('No CSS files in src/ (except styles.css)', () => {
		const cssFiles = collectFiles(SRC_DIR, ['.css'], ['node_modules'])
		const violations = cssFiles
			.filter((f) => !f.endsWith('styles.css'))
			.map((f) => relative(SRC_DIR, f))

		if (violations.length > 0) {
			expect.fail(
				`CSS files found (INVARIANT #10):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use Tailwind classes. Remove CSS files.`,
			)
		}
	})

	// --- INVARIANT #11: No hardcoded colors ---

	it('No hardcoded Tailwind color scales in components', () => {
		const violations: string[] = []
		// Patterns that indicate hardcoded colors
		// Catch ALL Tailwind color scales with numeric suffixes (emerald-500, amber-300, etc.).
		// bg-white/bg-black/text-white/text-black are caught separately.
		// ring-black/5 and ring-white/10 are excluded (valid shadcn opacity utilities).
		const colorPatterns = [
			/\bbg-white\b/,
			/\bbg-black\b/,
			/\btext-white\b/,
			/\btext-black\b/,
			/\b(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/,
			/\b(?:bg|text|border)-\[#[0-9a-fA-F]+\]/,
		]

		for (const file of allTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('*')) continue

				for (const pattern of colorPatterns) {
					if (pattern.test(line)) {
						violations.push(`${relPath}:${i + 1} — ${pattern.source}`)
					}
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Hardcoded colors found (INVARIANT #11):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use theme tokens (bg-background, text-foreground, text-muted-foreground, etc.)`,
			)
		}
	})

	// --- INVARIANT #7: No raw fetch() ---

	it('No raw fetch() calls in src/ (except api-client.ts)', () => {
		const violations: string[] = []

		for (const file of allTsFiles) {
			if (file.endsWith('api-client.ts')) continue
			if (file.includes('__tests__')) continue

			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('*')) continue
				if (line.trimStart().startsWith('import ')) continue

				if (/\bfetch\s*\(/.test(line)) {
					violations.push(`${relPath}:${i + 1} — raw fetch() call`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Raw fetch() calls found (INVARIANT #7):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use the api client from @/lib/api-client.`,
			)
		}
	})

	// --- INVARIANT #15: No dangerouslySetInnerHTML ---

	it('No dangerouslySetInnerHTML usage', () => {
		const violations: string[] = []

		for (const file of allTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.includes('dangerouslySetInnerHTML')) {
					violations.push(`${relPath}:${i + 1}`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`dangerouslySetInnerHTML found (INVARIANT #15):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Sanitize with DOMPurify, or remove.`,
			)
		}
	})

	// --- INVARIANT #27: No types/ directories ---

	it('No types/ directories or types.ts barrel files', () => {
		const violations: string[] = []

		// Check for types/ directories
		const checkForTypesDir = (dir: string): void => {
			let entries: string[]
			try {
				entries = readdirSync(dir)
			} catch {
				return
			}
			for (const entry of entries) {
				if (entry === 'node_modules') continue
				const fullPath = join(dir, entry)
				const stat = statSync(fullPath)
				if (stat.isDirectory()) {
					if (entry === 'types') {
						violations.push(`${relative(SRC_DIR, fullPath)}/ — types directory`)
					}
					checkForTypesDir(fullPath)
				} else if (entry === 'types.ts' || entry === 'types.tsx') {
					violations.push(`${relative(SRC_DIR, fullPath)} — types barrel file`)
				}
			}
		}

		checkForTypesDir(SRC_DIR)

		if (violations.length > 0) {
			expect.fail(
				`Type organization violation (INVARIANT #27):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Types live next to the code that uses them. No standalone type files.`,
			)
		}
	})

	// --- INVARIANT #13: One component per file ---

	it('No multiple component exports in a single .tsx file (slices)', () => {
		const sliceTsxFiles = collectFiles(SLICES_DIR, ['.tsx'])
		const violations: string[] = []

		for (const file of sliceTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			// Count exported function components
			const exportedComponents = content.match(/export\s+function\s+[A-Z]/g)
			const count = exportedComponents?.length ?? 0

			if (count > 1) {
				violations.push(`${relPath} — ${count} exported components (max 1)`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Multiple components per file (INVARIANT #13):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Split into separate files, one component per file.`,
			)
		}
	})

	// --- INVARIANT #14: Max ~200 lines per file ---

	it('No files exceeding 250 lines in slices/', () => {
		const sliceFiles = collectFiles(SLICES_DIR, ['.ts', '.tsx'])
		const violations: string[] = []
		const MAX_LINES = 250

		for (const file of sliceFiles) {
			const content = readFileSync(file, 'utf-8')
			const lineCount = content.split('\n').length
			const relPath = relative(SRC_DIR, file)

			if (lineCount > MAX_LINES) {
				violations.push(`${relPath} — ${lineCount} lines (max ${MAX_LINES})`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Files exceeding line limit (INVARIANT #14):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Split large files into smaller subcomponents or hooks.`,
			)
		}
	})

	// --- No cross-slice imports ---

	describe('No cross-slice imports', () => {
		const sliceNames = getSliceNames()
		// Allowed cross-slice imports (infra slices may import from auth for currentUser)
		const allowedCrossImports: Record<string, Set<string>> = {
			team: new Set(['auth']),
		}

		for (const sliceName of sliceNames) {
			it(`slices/${sliceName}/ does not import from other slices`, () => {
				const sliceDir = join(SLICES_DIR, sliceName)
				const files = collectFiles(sliceDir, ['.ts', '.tsx'], ['node_modules'])
				const violations: string[] = []
				const allowed = allowedCrossImports[sliceName] ?? new Set()

				for (const file of files) {
					const content = readFileSync(file, 'utf-8')
					const relPath = relative(SRC_DIR, file)

					for (const otherSlice of sliceNames) {
						if (otherSlice === sliceName) continue
						if (allowed.has(otherSlice)) continue

						const patterns = [
							`from '../../slices/${otherSlice}`,
							`from '../${otherSlice}`,
							`from '@/slices/${otherSlice}`,
						]
						for (const pattern of patterns) {
							if (content.includes(pattern)) {
								violations.push(`${relPath} imports from slices/${otherSlice}`)
							}
						}
					}
				}

				if (violations.length > 0) {
					expect.fail(
						`Cross-slice imports (INVARIANT):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Move shared code to lib/ or @repo/shared.`,
					)
				}
			})
		}
	})

	// --- INV-091: No placeholder text in component JSX ---

	it('No placeholder text in component JSX (INV-091)', () => {
		const violations: string[] = []
		const forbidden =
			/coming\s+soon|placeholder\s+component|todo:|not\s+implemented|implement\s+later/i

		for (const file of allTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('*')) continue
				if (line.trimStart().startsWith('import ')) continue

				if (forbidden.test(line)) {
					violations.push(`${relPath}:${i + 1} — placeholder text detected`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Placeholder text found (INV-091):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Implement the feature fully using generic CRUD components. Never use "coming soon" or "TODO" stubs.`,
			)
		}
	})

	// --- INV-092: CRUD list components must use generic components ---

	it('List components use generic CRUD components (INV-092)', () => {
		const listFiles = collectFiles(SLICES_DIR, ['.tsx']).filter((f) => f.match(/-list\.tsx$/))
		const violations: string[] = []

		for (const file of listFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			if (!content.includes("from '@/ui/data-table'")) {
				violations.push(`${relPath} — missing DataTable import from @/ui/data-table`)
			}
			if (!content.includes("from '@/ui/pagination'")) {
				violations.push(`${relPath} — missing Pagination import from @/ui/pagination`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`List components not using generic CRUD components (INV-092):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Import DataTable from @/ui/data-table and Pagination from @/ui/pagination. Do not build inline tables.`,
			)
		}
	})

	// --- INV-093: CRUD hooks must export list, create, update, delete ---

	it('CRUD hooks export all 4 operations (INV-093)', () => {
		// Only check standard CRUD slices (not infra slices like auth, team)
		const crudSlices = getCrudSliceNames().filter((name) => {
			const compsDir = join(SLICES_DIR, name, 'components')
			try {
				return readdirSync(compsDir).some((f) => f.endsWith('-list.tsx'))
			} catch {
				return false
			}
		})
		const hookFiles = crudSlices.flatMap((name) =>
			collectFiles(join(SLICES_DIR, name), ['.ts']).filter(
				(f) => f.match(/hooks\/use-[^/]+\.ts$/) && !f.includes('__tests__'),
			),
		)
		const violations: string[] = []

		for (const file of hookFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			const hasUseList = /export\s+function\s+use[A-Z]\w+s\(/.test(content)
			const hasCreate = /export\s+function\s+useCreate[A-Z]/.test(content)
			const hasUpdate = /export\s+function\s+useUpdate[A-Z]/.test(content)
			const hasDelete = /export\s+function\s+useDelete[A-Z]/.test(content)

			const missing: string[] = []
			if (!hasUseList) missing.push('useList (useXs)')
			if (!hasCreate) missing.push('useCreate')
			if (!hasUpdate) missing.push('useUpdate')
			if (!hasDelete) missing.push('useDelete')

			if (missing.length > 0) {
				violations.push(`${relPath} — missing: ${missing.join(', ')}`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Incomplete CRUD hooks (INV-093):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Every CRUD hook file must export useXs, useCreateX, useUpdateX, useDeleteX.`,
			)
		}
	})

	// --- INV-094: CRUD slices must have a route file ---

	it('CRUD slices have a route file in src/routes/_authed/ (INV-094)', () => {
		const crudSlices = getCrudSliceNames().filter((name) => {
			const compsDir = join(SLICES_DIR, name, 'components')
			try {
				return readdirSync(compsDir).some((f) => f.endsWith('-list.tsx'))
			} catch {
				return false
			}
		})
		const violations: string[] = []
		const routesDir = join(SRC_DIR, 'routes', '_authed')

		for (const name of crudSlices) {
			// Check for route file: index.tsx (for todos at root) or <name>.tsx
			let hasRoute = false
			try {
				const routeFiles = readdirSync(routesDir)
				hasRoute = routeFiles.some(
					(f) => f === `${name}.tsx` || (name === 'todos' && f === 'index.tsx'),
				)
			} catch {
				// routes dir doesn't exist
			}

			if (!hasRoute) {
				violations.push(`slices/${name}/ has -list.tsx but no route in routes/_authed/${name}.tsx`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`CRUD slices without route files (INV-094):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Create a route file in src/routes/_authed/<name>.tsx with validateSearch: parseListParams.`,
			)
		}
	})

	// --- INV-095: No client-side data manipulation in list components ---

	it('List components do not use client-side .filter()/.sort()/.slice() (INV-095)', () => {
		const listFiles = collectFiles(SLICES_DIR, ['.tsx']).filter((f) => f.match(/-list\.tsx$/))
		const violations: string[] = []
		const forbidden = /\.(filter|sort|toSorted|slice)\s*\(/

		for (const file of listFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('import ')) continue
				if (line.trimStart().startsWith('*')) continue

				if (forbidden.test(line)) {
					violations.push(
						`${relPath}:${i + 1} — client-side data manipulation: ${line.trim().slice(0, 60)}`,
					)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Client-side filtering/sorting in list components (INV-095):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: All filtering, sorting, and pagination must be server-side. Pass params to the API hook, never .filter()/.sort() the response.`,
			)
		}
	})

	// --- INV-096: List hooks must use safeParseResponse ---

	it('Hooks use safeParseResponse instead of raw .parse() (INV-096)', () => {
		const hookFiles = collectFiles(SLICES_DIR, ['.ts']).filter(
			(f) => f.match(/hooks\/use-[^/]+\.ts$/) && !f.includes('__tests__'),
		)
		const violations: string[] = []

		for (const file of hookFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('import ')) continue

				if (/Schema\.parse\(/.test(line) && !line.includes('safeParseResponse')) {
					violations.push(`${relPath}:${i + 1} — raw .parse() without safeParseResponse`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Raw Zod .parse() in hooks (INV-096):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use safeParseResponse(schema, json) from @/lib/api-error instead of schema.parse(json).`,
			)
		}
	})

	// --- INV-097: List hooks must use keepPreviousData ---

	it('List hooks use keepPreviousData (INV-097)', () => {
		const crudSlices = getSliceNames().filter((name) => {
			const compsDir = join(SLICES_DIR, name, 'components')
			try {
				return readdirSync(compsDir).some((f) => f.endsWith('-list.tsx'))
			} catch {
				return false
			}
		})
		const hookFiles = crudSlices.flatMap((name) =>
			collectFiles(join(SLICES_DIR, name), ['.ts']).filter(
				(f) => f.match(/hooks\/use-[^/]+\.ts$/) && !f.includes('__tests__'),
			),
		)
		const violations: string[] = []

		for (const file of hookFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			if (content.includes('useQuery') && !content.includes('keepPreviousData')) {
				violations.push(`${relPath} — has useQuery but missing keepPreviousData`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Missing keepPreviousData in list hooks (INV-097):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Add placeholderData: keepPreviousData to all list useQuery hooks. Import from @tanstack/react-query.`,
			)
		}
	})

	// --- INV-021: No useEffect for data fetching ---

	it('No useEffect used alongside API calls (INV-021)', () => {
		const violations: string[] = []

		for (const file of allTsFiles) {
			if (file.includes('__tests__')) continue
			if (file.includes('lib/')) continue

			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			const hasUseEffect = content.includes('useEffect')
			const hasApiCall =
				/\bapi\.(get|post|patch|delete)\b/.test(content) || /\bfetch\s*\(/.test(content)

			if (hasUseEffect && hasApiCall) {
				violations.push(
					`${relPath} — useEffect + API call in same file. Use TanStack Query instead.`,
				)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`useEffect used for data fetching (INV-021):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Replace useEffect + fetch/api with a TanStack Query hook (useQuery/useMutation).`,
			)
		}
	})

	// --- INV-070: Every form field must have a label ---

	it('Input elements have associated labels (INV-070)', () => {
		const sliceTsxFiles = collectFiles(SLICES_DIR, ['.tsx'])
		const violations: string[] = []

		for (const file of sliceTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue

				// Detect <Input or <input that renders a visible field (not checkbox/hidden)
				if (
					/<(?:Input|input)\b/.test(line) &&
					!line.includes('type="checkbox"') &&
					!line.includes('type="hidden"')
				) {
					// Check surrounding ~5 lines for a label or aria-label
					const context = lines.slice(Math.max(0, i - 5), i + 8).join('\n')
					const hasLabel = /htmlFor=|<label|aria-label/.test(context)
					if (!hasLabel) {
						violations.push(`${relPath}:${i + 1} — <Input> without label or aria-label nearby`)
					}
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Form inputs without labels (INV-070):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Add <label htmlFor="id"> before the input, or add aria-label to the input.`,
			)
		}
	})

	// --- INV-071: Anti double-submit ---

	it('Mutations use isPending for submit buttons (INV-071)', () => {
		const sliceTsxFiles = collectFiles(SLICES_DIR, ['.tsx'])
		const violations: string[] = []

		for (const file of sliceTsxFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			// Files that call useMutation-derived hooks (useCreate*, useUpdate*, useDelete*)
			const hasMutation = /useCreate[A-Z]|useUpdate[A-Z]|useDelete[A-Z]/.test(content)
			if (!hasMutation) continue

			// Must reference isPending somewhere (for submit button disabled state)
			if (!content.includes('isPending')) {
				violations.push(`${relPath} — uses mutation hooks but never references isPending`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Mutations without isPending guard (INV-071):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use mutation.isPending to disable submit buttons during mutations.`,
			)
		}
	})

	// --- INVARIANT #6: No local schema redefinitions ---

	it('No z.object() definitions in slices/ (schemas belong in @repo/shared)', () => {
		const sliceFiles = collectFiles(SLICES_DIR, ['.ts', '.tsx'])
		const violations: string[] = []

		for (const file of sliceFiles) {
			if (file.includes('__tests__')) continue

			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('import ')) continue
				if (line.trimStart().startsWith('//')) continue
				if (line.trimStart().startsWith('*')) continue

				if (/z\.object\s*\(/.test(line)) {
					violations.push(`${relPath}:${i + 1} — z.object() definition (should be in @repo/shared)`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Local Zod schemas found (INVARIANT #6):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Move schema definitions to @repo/shared.`,
			)
		}
	})

	// --- INV-100: Layouts ONLY in layouts/ ---

	it('No layout shells in components/ (INV-100)', () => {
		const compsDir = join(SRC_DIR, 'components')
		const files = collectFiles(compsDir, ['.tsx'])
		const violations: string[] = []
		const layoutPatterns = [/SidebarProvider/, /min-h-screen.*items-center.*justify-center/]
		const allowList = ['error-boundary.tsx'] // error fallback UI, not a layout shell

		for (const file of files) {
			if (allowList.some((f) => file.endsWith(f))) continue
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			for (const pattern of layoutPatterns) {
				if (pattern.test(content)) {
					violations.push(`${relPath} — contains layout pattern (${pattern.source})`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Layout shells found outside layouts/ (INV-100):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Move layout shells to src/layouts/. Only error-boundary.tsx and non-layout components belong in components/.`,
			)
		}
	})

	// --- INV-101: Navigation must be data-driven ---

	it('Authed layout uses nav-items (INV-101)', () => {
		const layoutFile = join(SRC_DIR, 'layouts', 'authed-layout.tsx')
		let content: string
		try {
			content = readFileSync(layoutFile, 'utf-8')
		} catch {
			expect.fail('INV-101: layouts/authed-layout.tsx not found')
			return
		}

		if (!content.includes("from './nav-items'")) {
			expect.fail(
				'INV-101: authed-layout.tsx must import from ./nav-items. Navigation must be data-driven, not hardcoded JSX.',
			)
		}
	})

	// --- INV-102: No max-w-* in layout files (except content-area.tsx) ---

	it('No hardcoded max-w-* in layout files except content-area (INV-102)', () => {
		const layoutsDir = join(SRC_DIR, 'layouts')
		const files = collectFiles(layoutsDir, ['.tsx'])
		const violations: string[] = []

		for (const file of files) {
			if (file.endsWith('content-area.tsx')) continue // max-w variants live here
			if (file.endsWith('public-layout.tsx')) continue // max-w-sm is card width, not page width
			if (file.endsWith('not-found.tsx')) continue // full-page 404 with inline text width constraint
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (line.trimStart().startsWith('//')) continue
				if (/max-w-/.test(line)) {
					violations.push(`${relPath}:${i + 1} — hardcoded max-w-* (must be in content-area.tsx)`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Hardcoded max-w-* in layout files (INV-102):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Width constraints belong in content-area.tsx variants only.`,
			)
		}
	})

	// --- INV-103: No deep relative imports ---

	it('No relative imports deeper than 2 levels (INV-103)', () => {
		const violations: string[] = []

		for (const file of allTsFiles) {
			if (file.includes('__tests__')) continue
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''
				if (!line.trimStart().startsWith('import ')) continue
				if (/from\s+['"]\.\.\/\.\.\/\.\./.test(line)) {
					violations.push(`${relPath}:${i + 1} — deep relative import (use @/ alias)`)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Deep relative imports found (INV-103):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Use @/ alias for cross-directory imports. Relative imports only for same-directory siblings.`,
			)
		}
	})

	// --- INV-104: CRUD slices must have a nav entry ---

	it('CRUD slices have an entry in nav-items.ts (INV-104)', () => {
		const crudSlices = getCrudSliceNames().filter((name) => {
			const compsDir = join(SLICES_DIR, name, 'components')
			try {
				return readdirSync(compsDir).some((f) => f.endsWith('-list.tsx'))
			} catch {
				return false
			}
		})

		let navContent: string
		try {
			navContent = readFileSync(join(SRC_DIR, 'layouts', 'nav-items.ts'), 'utf-8')
		} catch {
			if (crudSlices.length > 0) {
				expect.fail('INV-104: layouts/nav-items.ts not found but CRUD slices exist')
			}
			return
		}

		const violations: string[] = []
		for (const name of crudSlices) {
			if (!navContent.includes(`'/${name}'`)) {
				violations.push(`slices/${name}/ has -list.tsx but no entry in nav-items.ts for /${name}`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`CRUD slices without nav entry (INV-104):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Add an entry to layouts/nav-items.ts for each CRUD slice.`,
			)
		}
	})

	// --- INV-105: Routes with beforeLoad must have pendingComponent ---

	it('Authed routes with beforeLoad have pendingComponent (INV-105)', () => {
		const authedRoute = join(SRC_DIR, 'routes', '_authed.tsx')
		let content: string
		try {
			content = readFileSync(authedRoute, 'utf-8')
		} catch {
			return
		}

		if (content.includes('beforeLoad') && !content.includes('pendingComponent')) {
			expect.fail(
				'INV-105: routes/_authed.tsx has beforeLoad but no pendingComponent. Add a loading skeleton to prevent white flash during auth check.',
			)
		}
	})

	// --- INV-106: CRUD list components must use ConfirmDelete ---

	it('CRUD list components use ConfirmDelete (INV-106)', () => {
		const listFiles = collectFiles(SLICES_DIR, ['.tsx']).filter((f) => f.match(/-list\.tsx$/))
		const violations: string[] = []

		for (const file of listFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)

			if (!content.includes('ConfirmDelete')) {
				violations.push(
					`${relPath} — missing ConfirmDelete (destructive actions need confirmation)`,
				)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`CRUD lists without ConfirmDelete (INV-106):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Import ConfirmDelete from @/ui/confirm-delete. All delete actions require confirmation dialog.`,
			)
		}
	})

	// --- INV-107: CRUD hooks must export useBulkDelete ---

	it('CRUD hooks export bulk delete (INV-107)', () => {
		const crudSlices = getCrudSliceNames().filter((name) => {
			const compsDir = join(SLICES_DIR, name, 'components')
			try {
				return readdirSync(compsDir).some((f) => f.endsWith('-list.tsx'))
			} catch {
				return false
			}
		})
		const violations: string[] = []

		for (const name of crudSlices) {
			const hookFiles = collectFiles(join(SLICES_DIR, name, 'hooks'), ['.ts']).filter(
				(f) => !f.includes('__tests__'),
			)
			const hasBulkDelete = hookFiles.some((f) => {
				const content = readFileSync(f, 'utf-8')
				return /useBulkDelete/.test(content)
			})

			if (!hasBulkDelete) {
				violations.push(`slices/${name}/ — no useBulkDelete hook (bulk operations required)`)
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`CRUD slices without bulk delete (INV-107):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Add useBulkDelete hook using useBulkDelete() from @/lib/use-bulk-delete.`,
			)
		}
	})

	// --- INV-108: SearchInput debounce must be 600ms ---

	it('SearchInput debounce is 600ms (INV-108)', () => {
		const searchFile = join(SRC_DIR, 'ui', 'search-input.tsx')
		let content: string
		try {
			content = readFileSync(searchFile, 'utf-8')
		} catch {
			return
		}

		if (!content.includes('600')) {
			expect.fail(
				'INV-108: SearchInput debounce must be 600ms. Found a different value in ui/search-input.tsx.',
			)
		}
	})

	// --- INV-112: No local redefinitions of lib/ exports ---

	it('Slices do not redefine functions exported by lib/ (INV-112)', () => {
		const LIB_DIR = join(SRC_DIR, 'lib')
		const libFiles = collectFiles(LIB_DIR, ['.ts', '.tsx'], ['node_modules', '__tests__'])

		// Collect all exported function/const names from lib/ (skip comments)
		const libExports = new Set<string>()
		for (const file of libFiles) {
			const content = readFileSync(file, 'utf-8')
			const lines = content.split('\n')
			for (const line of lines) {
				const trimmed = line.trimStart()
				if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue
				const fnMatch = line.match(/export\s+function\s+(\w+)/)
				if (fnMatch?.[1]) libExports.add(fnMatch[1])
				const constMatch = line.match(/export\s+const\s+(\w+)/)
				if (constMatch?.[1]) libExports.add(constMatch[1])
			}
		}

		if (libExports.size === 0) return

		// Scan slices for local function definitions that shadow lib exports
		const sliceFiles = collectFiles(SLICES_DIR, ['.ts', '.tsx'], ['node_modules', '__tests__'])
		const violations: string[] = []

		for (const file of sliceFiles) {
			const content = readFileSync(file, 'utf-8')
			const relPath = relative(SRC_DIR, file)
			const lines = content.split('\n')

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? ''

				// Match: function name( or const name =
				const fnMatch = line.match(/^\s*(?:export\s+)?function\s+(\w+)\s*\(/)
				const constMatch = line.match(/^\s*(?:export\s+)?const\s+(\w+)\s*=/)
				const name = fnMatch?.[1] ?? constMatch?.[1]

				if (name && libExports.has(name)) {
					const libFile = libFiles.find((f) => {
						const c = readFileSync(f, 'utf-8')
						return (
							new RegExp(`export\\s+function\\s+${name}\\b`).test(c) ||
							new RegExp(`export\\s+const\\s+${name}\\b`).test(c)
						)
					})
					const libName = libFile ? relative(SRC_DIR, libFile) : 'lib/'
					violations.push(
						`${relPath}:${i + 1} defines ${name}() but ${libName} already exports it. Import from @/${libName.replace(/\.tsx?$/, '')} instead.`,
					)
				}
			}
		}

		if (violations.length > 0) {
			expect.fail(
				`Local redefinitions of lib/ exports (INV-112):\n${violations.map((v) => `  - ${v}`).join('\n')}\n\nFix: Import the function from lib/ instead of redefining it locally.`,
			)
		}
	})
})
