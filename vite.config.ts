import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		vinext(),
		cloudflare({
			viteEnvironment: {
				childEnvironments: ['ssr'],
				name: 'rsc',
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
});
