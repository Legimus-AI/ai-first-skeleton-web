import { Button } from '@/ui/button'
import { CopyableBlock } from './copyable-block'

interface NewApiKeyNoticeProps {
	rawKey: string
	onClose: () => void
}

/** A key just created (shown once) and how an agent uses it: MCP server or the project CLI. */
export function NewApiKeyNotice({ rawKey, onClose }: NewApiKeyNoticeProps) {
	// The API, /mcp included, is served from this same origin (nginx in production, Vite in dev).
	const apiOrigin = globalThis.location.origin
	const mcpConnection = `URL: ${apiOrigin}/mcp\nAuthorization: Bearer ${rawKey}`
	const cliSetup = `export AGENT_API_URL=${apiOrigin}\nexport AGENT_API_KEY=${rawKey}\npnpm agent list`

	return (
		<div
			role="status"
			className="animate-in fade-in slide-in-from-top-2 space-y-5 rounded-surface border border-primary/20 bg-primary/5 p-(--surface-padding)"
		>
			<div className="space-y-3">
				<div className="space-y-1">
					<p className="text-sm font-medium text-foreground">Tu nueva clave API está lista</p>
					<p className="text-xs text-muted-foreground">
						Cópiala ahora. Por seguridad, no se volverá a mostrar.
					</p>
				</div>
				<CopyableBlock label="la clave" text={rawKey} />
			</div>

			<div className="space-y-3">
				<p className="text-sm font-medium text-foreground">Conecta un agente</p>
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground">
						Servidor MCP: agrega esta URL y esta cabecera en tu cliente MCP. Solo verá las
						herramientas que la clave permite.
					</p>
					<CopyableBlock label="la conexión MCP" text={mcpConnection} />
				</div>
				<div className="space-y-2">
					<p className="text-xs text-muted-foreground">
						CLI del proyecto: corre esto en la raíz del repositorio.
					</p>
					<CopyableBlock label="la configuración del CLI" text={cliSetup} />
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onClose}
				className="text-muted-foreground hover:text-foreground"
			>
				Cerrar
			</Button>
		</div>
	)
}
