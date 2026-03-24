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
		const colorPatterns = [
			/\bbg-white\b/,
			/\bbg-black\b/,
			/\btext-white\b/,
			/\btext-black\b/,
			/\bbg-gray-\d+/,
			/\btext-gray-\d+/,
			/\bborder-gray-\d+/,
			/\bbg-red-\d+/,
			/\btext-red-\d+/,
			/\bbg-blue-\d+/,
			/\btext-blue-\d+/,
			/\bbg-green-\d+/,
			/\btext-green-\d+/,
			/\bbg-\[#[0-9a-fA-F]+\]/,
			/\btext-\[#[0-9a-fA-F]+\]/,
			/\bborder-\[#[0-9a-fA-F]+\]/,
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

		for (const sliceName of sliceNames) {
			it(`slices/${sliceName}/ does not import from other slices`, () => {
				const sliceDir = join(SLICES_DIR, sliceName)
				const files = collectFiles(sliceDir, ['.ts', '.tsx'], ['node_modules'])
				const violations: string[] = []

				for (const file of files) {
					const content = readFileSync(file, 'utf-8')
					const relPath = relative(SRC_DIR, file)

					for (const otherSlice of sliceNames) {
						if (otherSlice === sliceName) continue

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
		// Only check slices that have a *-list.tsx component (= CRUD slices)
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
})
