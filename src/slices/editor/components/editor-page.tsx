import { useState } from 'react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

// ─── Editor Page — focused-tool reference slice ──────────────────────────────
// Demonstrates the `focused-tool` archetype: a single-artifact composer where the
// content is the hero. Pairs with the focused-layout shell (no persistent nav).
// No DataTable, no *-list.tsx, no CRUD contract — only CORE invariants apply
// (semantic tokens, a11y, type-safety). See INVARIANTS.md "Rule Layers".
//
// This skeleton has no documents backend, so the draft lives in client state.
// With a real backend: load via TanStack Query (queryOptions + route loader),
// persist via useMutation (debounced autosave) and surface the saved state here.

const initialBody =
	'This is the focused-tool reference slice. Edit the title and body — the word ' +
	'count updates live and Save snapshots the draft to local state.'

export function EditorPage() {
	const [title, setTitle] = useState('Untitled document')
	const [body, setBody] = useState(initialBody)
	const [saved, setSaved] = useState({ title: 'Untitled document', body: initialBody })

	const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
	const isDirty = title !== saved.title || body !== saved.body

	function save() {
		setSaved({ title, body })
	}

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<span
						className={
							isDirty
								? 'inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
								: 'inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
						}
					>
						{isDirty ? 'Unsaved changes' : 'Saved'}
					</span>
					<span className="text-xs text-muted-foreground">{wordCount} words</span>
				</div>
				<Button onClick={save} disabled={!isDirty}>
					Save
				</Button>
			</header>

			<label htmlFor="doc-title" className="sr-only">
				Document title
			</label>
			<Input
				id="doc-title"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				placeholder="Untitled document"
				className="h-auto border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight hover:border-0 focus-visible:ring-0"
			/>

			<label htmlFor="doc-body" className="sr-only">
				Document body
			</label>
			<textarea
				id="doc-body"
				value={body}
				onChange={(event) => setBody(event.target.value)}
				placeholder="Start writing…"
				className="min-h-[60vh] w-full resize-none rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
			/>
		</div>
	)
}
