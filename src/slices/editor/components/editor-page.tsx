import { useState } from 'react'
import { DemoNotice } from '@/ui/demo-notice'
import { Input } from '@/ui/input'

// ─── Editor Page — focused-tool reference slice ──────────────────────────────
// Demonstrates the `focused-tool` archetype: a single-artifact composer where the
// content is the hero. Pairs with the focused-layout shell (no persistent nav).
// No DataTable, no *-list.tsx, no CRUD contract — only CORE invariants apply
// (semantic tokens, a11y, type-safety). See INVARIANTS.md "Rule Layers".
//
// This skeleton has no documents backend, so the draft lives in client state and nothing
// claims to be saved. With a real backend: load via TanStack Query (queryOptions + route
// loader), persist via useMutation (debounced autosave) and show the saved state here.

const initialBody =
	'Este es el ejemplo de herramienta enfocada. Edita el título y el texto: el conteo de ' +
	'palabras se actualiza mientras escribes.'

export function EditorPage() {
	const [title, setTitle] = useState('Documento sin título')
	const [body, setBody] = useState(initialBody)

	const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

	return (
		<div className="flex flex-col gap-6">
			<DemoNotice />
			<header className="flex items-center gap-3">
				<span className="text-xs text-muted-foreground">
					{wordCount} palabra{wordCount === 1 ? '' : 's'}
				</span>
			</header>

			<label htmlFor="doc-title" className="sr-only">
				Título del documento
			</label>
			<Input
				id="doc-title"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				placeholder="Documento sin título"
				className="h-auto border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight hover:border-0"
			/>

			<label htmlFor="doc-body" className="sr-only">
				Contenido del documento
			</label>
			<textarea
				id="doc-body"
				value={body}
				onChange={(event) => setBody(event.target.value)}
				placeholder="Empieza a escribir…"
				className="min-h-[60vh] w-full resize-none rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
			/>
		</div>
	)
}
