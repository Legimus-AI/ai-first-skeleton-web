import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [TanStackRouterVite(), react(), tailwindcss()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	server: {
		port: 5173,
		proxy: {
			'/api/': {
				target: process.env.VITE_API_URL || 'http://localhost:3000',
				changeOrigin: true,
				// Sends X-Forwarded-For, so the API rate-limits each client, not the whole dev machine.
				xfwd: true,
			},
			// Same origin as in production (nginx proxies /mcp too), so the MCP URL shown in the app works.
			'^/mcp$': {
				target: process.env.VITE_API_URL || 'http://localhost:3000',
				changeOrigin: true,
				xfwd: true,
			},
		},
	},
})
