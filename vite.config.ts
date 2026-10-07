import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiProxy = {
	target: process.env.VITE_API_URL || 'http://localhost:3000',
	changeOrigin: true,
	// Sends X-Forwarded-For, so the API rate-limits each client, not the whole dev machine.
	xfwd: true,
}

export default defineConfig({
	plugins: [TanStackRouterVite(), react(), tailwindcss()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	server: {
		port: 5173,
		// The API's public paths, routed as the production proxy routes them: the MCP URL shown in the
		// app and the OAuth discovery an MCP client reads (RFC 8414, RFC 9728, OpenID) work from here.
		proxy: {
			'/api/': apiProxy,
			'^/mcp$': apiProxy,
			'/.well-known/oauth-': apiProxy,
			'/.well-known/openid-configuration': apiProxy,
		},
	},
})
