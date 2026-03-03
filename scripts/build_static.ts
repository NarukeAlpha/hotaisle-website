import { spawn } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { appRouter } from '../node_modules/vinext/dist/routing/app-router.js';
import { BLOG_POSTS } from '../src/generated/blog-data';
import { POLICIES } from '../src/generated/static-content-data';

const EXPORT_ORIGIN = 'https://static.hotaisle.local';
const RSC_EMBEDDED_SCRIPT_REGEX =
	/<script>self\.__VINEXT_RSC_(?:CHUNKS__=self\.__VINEXT_RSC_CHUNKS__\|\|\[];self\.__VINEXT_RSC_CHUNKS__\.push\([\s\S]*?\)|DONE__=true)<\/script>/g;
const HTML_CLOSE_TAG = '</html>';
const BODY_CLOSE_TAG = '</body>';
const BOOTSTRAP_SCRIPT_ID = '<script id="_R_">';
const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const DIST_DIRECTORY = path.join(PROJECT_ROOT, 'dist');
const CLIENT_DIRECTORY = path.join(DIST_DIRECTORY, 'client');
const APP_DIRECTORY = path.join(PROJECT_ROOT, 'src', 'app');
const SERVER_ENTRY_PATH = path.join(DIST_DIRECTORY, 'server', 'index.js');
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECT_HOPS = 10;

process.env.NODE_ENV = 'production';

await rm(DIST_DIRECTORY, { force: true, recursive: true });

const buildProcess = spawn('bun', ['run', 'vinext', 'build'], {
	cwd: PROJECT_ROOT,
	stdio: 'inherit',
});

const exitCode = await new Promise<number>((resolve, reject) => {
	buildProcess.on('close', (code) => resolve(code ?? 1));
	buildProcess.on('error', reject);
});

if (exitCode !== 0) {
	throw new Error(`vinext build failed with exit code ${exitCode}`);
}

await cp(CLIENT_DIRECTORY, DIST_DIRECTORY, { force: true, recursive: true });

const routes = await appRouter(APP_DIRECTORY);
const exportedPaths = new Set<string>();

for (const route of routes) {
	if (!route.pagePath || route.isDynamic) {
		continue;
	}

	exportedPaths.add(route.pattern);
}

for (const post of BLOG_POSTS) {
	exportedPaths.add(`/blog/${post.slug}`);
}

for (const policy of POLICIES) {
	exportedPaths.add(`/policies/${policy.slug}`);
}

const serverModule = await import(pathToFileURL(SERVER_ENTRY_PATH).href);
const renderRoute = serverModule.default as (request: Request) => Promise<Response>;

if (typeof renderRoute !== 'function') {
	throw new Error('vinext build did not produce a callable server handler');
}

for (const routePath of exportedPaths) {
	const requestPath = toRequestPath(routePath);
	const htmlResponse = await renderStaticRoute(renderRoute, requestPath, 'text/html');

	if (!htmlResponse.ok) {
		throw new Error(`Failed to export ${routePath}: ${htmlResponse.status}`);
	}

	const html = normalizeExportedHtml(await htmlResponse.text());
	const outputPath = toOutputPath(routePath);
	const fullPath = path.join(DIST_DIRECTORY, outputPath);

	await mkdir(path.dirname(fullPath), { recursive: true });
	await writeFile(fullPath, html, 'utf8');

	const rscResponse = await renderStaticRoute(renderRoute, requestPath, 'text/x-component');

	if (!rscResponse.ok) {
		throw new Error(`Failed to export RSC payload for ${routePath}: ${rscResponse.status}`);
	}

	const rscPayload = normalizeRscPayload(await rscResponse.text());
	const rscOutputPath = toRscOutputPath(routePath);

	await writeFile(path.join(DIST_DIRECTORY, rscOutputPath), rscPayload, 'utf8');
}

const notFoundResponse = await renderRoute(
	new Request(`${EXPORT_ORIGIN}/__nonexistent_page_for_404__`, {
		headers: { accept: 'text/html' },
	})
);

if (notFoundResponse.status === 404) {
	const notFoundHtml = normalizeExportedHtml(await notFoundResponse.text());
	await writeFile(path.join(DIST_DIRECTORY, '404.html'), notFoundHtml, 'utf8');
}

function toOutputPath(routePath: string): string {
	if (routePath === '/') {
		return 'index.html';
	}

	const normalizedPath = routePath.replace(/^\/+|\/+$/g, '');
	return path.join(normalizedPath, 'index.html');
}

function toRequestPath(routePath: string): string {
	if (routePath === '/') {
		return routePath;
	}

	return routePath.endsWith('/') ? routePath : `${routePath}/`;
}

function toRscOutputPath(routePath: string): string {
	if (routePath === '/') {
		return '.rsc';
	}

	const normalizedPath = routePath.replace(/^\/+|\/+$/g, '');
	return `${normalizedPath}.rsc`;
}

function normalizeExportedHtml(html: string): string {
	const embeddedScripts = html.match(RSC_EMBEDDED_SCRIPT_REGEX) ?? [];

	if (embeddedScripts.length === 0) {
		return normalizeRscPayload(html);
	}

	const htmlWithoutEmbeddedScripts = html.replace(RSC_EMBEDDED_SCRIPT_REGEX, '');
	const normalizedEmbeddedScripts = embeddedScripts
		.map((script) => normalizeRscPayload(script))
		.join('');

	const bootstrapScriptIndex = htmlWithoutEmbeddedScripts.indexOf(BOOTSTRAP_SCRIPT_ID);

	if (bootstrapScriptIndex !== -1) {
		return `${htmlWithoutEmbeddedScripts.slice(0, bootstrapScriptIndex)}${normalizedEmbeddedScripts}${htmlWithoutEmbeddedScripts.slice(bootstrapScriptIndex)}`;
	}

	const bodyCloseTagIndex = htmlWithoutEmbeddedScripts.indexOf(BODY_CLOSE_TAG);

	if (bodyCloseTagIndex !== -1) {
		return `${htmlWithoutEmbeddedScripts.slice(0, bodyCloseTagIndex)}${normalizedEmbeddedScripts}${htmlWithoutEmbeddedScripts.slice(bodyCloseTagIndex)}`;
	}

	const htmlCloseTagIndex = htmlWithoutEmbeddedScripts.indexOf(HTML_CLOSE_TAG);

	if (htmlCloseTagIndex !== -1) {
		return `${htmlWithoutEmbeddedScripts.slice(0, htmlCloseTagIndex)}${normalizedEmbeddedScripts}${htmlWithoutEmbeddedScripts.slice(htmlCloseTagIndex)}`;
	}

	return `${htmlWithoutEmbeddedScripts}${normalizedEmbeddedScripts}`;
}

async function renderStaticRoute(
	renderRoute: (request: Request) => Promise<Response>,
	requestPath: string,
	accept: string
): Promise<Response> {
	let currentUrl = new URL(requestPath, EXPORT_ORIGIN);

	for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
		const response = await renderRoute(
			new Request(currentUrl, {
				headers: { accept },
			})
		);

		if (!REDIRECT_STATUS_CODES.has(response.status)) {
			return response;
		}

		const location = response.headers.get('location');
		if (!location) {
			throw new Error(`Redirect from ${currentUrl.pathname} missing location header`);
		}

		const nextUrl = new URL(location, currentUrl);
		if (nextUrl.origin !== EXPORT_ORIGIN) {
			throw new Error(
				`External redirect while exporting ${currentUrl.pathname}: ${location}`
			);
		}

		currentUrl = nextUrl;
	}

	throw new Error(`Too many redirects while exporting ${requestPath}`);
}

function normalizeRscPayload(html: string): string {
	const normalizedPayload = html
		.split('\n')
		.map((line) => {
			if (
				line.startsWith(':N') ||
				line.startsWith(':W') ||
				line.startsWith(':D') ||
				line.startsWith(':J')
			) {
				return '';
			}

			if (line.includes(':HL[')) {
				return line.replaceAll('stylesheet', 'style');
			}

			return line;
		})
		.join('\n');

	return normalizedPayload
		.replaceAll('"rel":"stylesheet"', '"rel":"style"')
		.replaceAll('\\"rel\\":\\"stylesheet\\"', '\\"rel\\":\\"style\\"');
}
