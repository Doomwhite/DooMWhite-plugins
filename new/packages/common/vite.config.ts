import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/main.ts'), // Entry point
			name: 'common', // Library name
			formats: ['es', 'cjs'], // Generate both ESM and CJS formats
			fileName: (format) => `common.${format}.js`, // Output file names
		},
		rollupOptions: {
			external: ['obsidian'], // Mark 'obsidian' as external
		},
	},
	resolve: {
		alias: {
			src: resolve(__dirname, 'src/'), // Resolve 'src/' for cleaner imports
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true, // Ensure type definitions are generated
		}),
	],
});
