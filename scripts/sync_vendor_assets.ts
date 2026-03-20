import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const MERMAID_SOURCE_PATH = path.join(
	PROJECT_ROOT,
	'node_modules',
	'mermaid',
	'dist',
	'mermaid.esm.min.mjs'
);
const VENDOR_DIRECTORY = path.join(PROJECT_ROOT, 'public', 'assets', 'vendor');
const MERMAID_CHUNKS_SOURCE_DIRECTORY = path.join(
	PROJECT_ROOT,
	'node_modules',
	'mermaid',
	'dist',
	'chunks',
	'mermaid.esm.min'
);
const MERMAID_TARGET_PATH = path.join(VENDOR_DIRECTORY, 'mermaid.esm.min.mjs');
const MERMAID_CHUNKS_TARGET_DIRECTORY = path.join(VENDOR_DIRECTORY, 'chunks', 'mermaid.esm.min');

await mkdir(VENDOR_DIRECTORY, { recursive: true });
await copyFile(MERMAID_SOURCE_PATH, MERMAID_TARGET_PATH);
await rm(MERMAID_CHUNKS_TARGET_DIRECTORY, { force: true, recursive: true });
await mkdir(path.dirname(MERMAID_CHUNKS_TARGET_DIRECTORY), { recursive: true });
await cp(MERMAID_CHUNKS_SOURCE_DIRECTORY, MERMAID_CHUNKS_TARGET_DIRECTORY, {
	force: true,
	recursive: true,
});

console.log('Synced vendor assets.');
