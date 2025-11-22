import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: [],
		alias: {
			// Resolve `@/` to the package `src` directory
			'@': path.resolve(__dirname, 'src'),
		},
	},
})
