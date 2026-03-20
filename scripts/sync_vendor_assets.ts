import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

declare const Bun: typeof import('bun');

const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const MERMAID_RENDER_ENTRY_PATH = path.join(PROJECT_ROOT, 'src', 'app', 'mermaid-render.ts');
const VENDOR_DIRECTORY = path.join(PROJECT_ROOT, 'public', 'assets', 'vendor');

await rm(VENDOR_DIRECTORY, { force: true, recursive: true });
await mkdir(VENDOR_DIRECTORY, { recursive: true });

const buildResult = await Bun.build({
	entrypoints: [MERMAID_RENDER_ENTRY_PATH],
	format: 'esm',
	minify: true,
	naming: 'mermaid-render.js',
	outdir: VENDOR_DIRECTORY,
	splitting: false,
	target: 'browser',
});

if (!buildResult.success) {
	for (const log of buildResult.logs) {
		console.error(log);
	}

	throw new Error('Failed to bundle Mermaid render script.');
}

console.log('Synced vendor assets.');
