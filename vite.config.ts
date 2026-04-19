import fs from 'node:fs';
import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';

const LOCAL_TLS_CERT_PATH = path.resolve(import.meta.dirname, './.dev-localhost-cert.pem');
const LOCAL_TLS_KEY_PATH = path.resolve(import.meta.dirname, './.dev-localhost-key.pem');
const DEV_SERVER_PORT = 4174;

export default defineConfig({
	optimizeDeps: {
		exclude: ['lucide-react'],
	},
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
	server: {
		https: {
			cert: fs.readFileSync(LOCAL_TLS_CERT_PATH),
			key: fs.readFileSync(LOCAL_TLS_KEY_PATH),
		},
		port: DEV_SERVER_PORT,
		strictPort: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
});
