import { spawn } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform as transformWithEsbuild } from 'esbuild';
import { appRouter } from '../node_modules/vinext/dist/routing/app-router.js';
import { BLOG_POSTS } from '../src/generated/blog-data';
import { POLICIES } from '../src/generated/static-content-data';

const EXPORT_ORIGIN = 'https://static.hotaisle.local';
const HTML_CLOSE_TAG = '</html>';
const THEME_ASSET_PATH = '/assets/theme.js';
const THEME_ASSET_OUTPUT_PATH = path.join('assets', 'theme.js');
const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const DIST_DIRECTORY = path.join(PROJECT_ROOT, 'dist');
const CLIENT_DIRECTORY = path.join(DIST_DIRECTORY, 'client');
const APP_DIRECTORY = path.join(PROJECT_ROOT, 'src', 'app');
const SERVER_ENTRY_PATH = path.join(DIST_DIRECTORY, 'server', 'index.js');
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECT_HOPS = 10;
const RSC_TEXT_CHUNK_START_REGEX = /^[0-9a-z]+:T[0-9a-z]+,$/;
const RSC_RECORD_START_REGEX = /^[0-9a-z]+:/;
const RSC_RECORD_PREFIX_REGEX = /^([0-9a-z]+:)(.+)$/;
const THEME_SCRIPT = `
(() => {
	const STORAGE_KEY = 'theme';
	const DARK_CLASS = 'dark';
	const LIGHT_CLASS = 'light';
	const SELECTOR = '[data-theme-toggle]';

	const getStoredTheme = () => {
		try {
			return window.localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	};

	const persistTheme = (theme) => {
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {}
	};

	const getPreferredTheme = () => {
		const storedTheme = getStoredTheme();
		if (storedTheme === DARK_CLASS || storedTheme === LIGHT_CLASS) {
			return storedTheme;
		}

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_CLASS : LIGHT_CLASS;
	};

	const applyTheme = (theme) => {
		const root = document.documentElement;
		root.classList.remove(LIGHT_CLASS, DARK_CLASS);
		root.classList.add(theme);
		root.dataset.theme = theme;

		const nextTheme = theme === DARK_CLASS ? LIGHT_CLASS : DARK_CLASS;
		for (const button of document.querySelectorAll(SELECTOR)) {
			button.setAttribute('aria-label', 'Switch to ' + nextTheme + ' mode');
			button.setAttribute('title', 'Switch to ' + nextTheme + ' mode');
			const label = button.querySelector('[data-theme-label]');
			if (label) {
				label.textContent = theme === DARK_CLASS ? 'Dark' : 'Light';
			}
		}
	};

	const toggleTheme = () => {
		const nextTheme = document.documentElement.classList.contains(DARK_CLASS)
			? LIGHT_CLASS
			: DARK_CLASS;
		persistTheme(nextTheme);
		applyTheme(nextTheme);
	};

	window.__toggleTheme = toggleTheme;

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}

		const button = target.closest(SELECTOR);
		if (!(button instanceof HTMLButtonElement)) {
			return;
		}

		toggleTheme();
	});

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const syncPreferredTheme = () => {
		if (getStoredTheme() === null) {
			applyTheme(getPreferredTheme());
		}
	};

	if (typeof mediaQuery.addEventListener === 'function') {
		mediaQuery.addEventListener('change', syncPreferredTheme);
	} else if (typeof mediaQuery.addListener === 'function') {
		mediaQuery.addListener(syncPreferredTheme);
	}

	applyTheme(getPreferredTheme());
})();
`;

process.env.NODE_ENV = 'production';

const MINIFIED_THEME_SCRIPT = await minifyInlineBlockContent('script', '', THEME_SCRIPT);

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
await writeFile(path.join(DIST_DIRECTORY, THEME_ASSET_OUTPUT_PATH), MINIFIED_THEME_SCRIPT, 'utf8');

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
	const rawHtml = await htmlResponse.text();

	const rscResponse = await renderStaticRoute(renderRoute, requestPath, 'text/x-component');

	if (!rscResponse.ok) {
		throw new Error(`Failed to export RSC payload for ${routePath}: ${rscResponse.status}`);
	}

	const rscPayload = await normalizeRscPayload(await rscResponse.text());
	const html = await normalizeExportedHtml(rawHtml, rscPayload);
	const outputPath = toOutputPath(routePath);
	const fullPath = path.join(DIST_DIRECTORY, outputPath);

	await mkdir(path.dirname(fullPath), { recursive: true });
	await writeFile(fullPath, html, 'utf8');
	const rscOutputPath = toRscOutputPath(routePath);

	await writeFile(path.join(DIST_DIRECTORY, rscOutputPath), rscPayload, 'utf8');

	if (routePath === '/') {
		await writeFile(path.join(DIST_DIRECTORY, 'index.rsc'), rscPayload, 'utf8');
	}
}

const notFoundResponse = await renderRoute(
	new Request(`${EXPORT_ORIGIN}/__nonexistent_page_for_404__`, {
		headers: { accept: 'text/html' },
	})
);

if (notFoundResponse.status === 404) {
	const notFoundHtml = await normalizeExportedHtml(await notFoundResponse.text());
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

async function normalizeExportedHtml(html: string, rscPayload: string): Promise<string> {
	const htmlDocument = stripTrailingContentAfterHtml(html);
	const htmlWithRscPayload = injectInitialRscPayload(htmlDocument, rscPayload);
	const htmlWithThemeScripts = injectThemeScripts(htmlWithRscPayload);

	return await minifyExportedHtml(htmlWithThemeScripts);
}

function stripTrailingContentAfterHtml(html: string): string {
	const htmlCloseIndex = html.lastIndexOf(HTML_CLOSE_TAG);
	if (htmlCloseIndex === -1) {
		return html;
	}

	return html.slice(0, htmlCloseIndex + HTML_CLOSE_TAG.length);
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

async function normalizeRscPayload(html: string): Promise<string> {
	const lines = html.split('\n');
	const normalizedLines: string[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? '';
		if (
			line.startsWith(':N') ||
			line.startsWith(':W') ||
			line.startsWith(':D') ||
			line.startsWith(':J')
		) {
			continue;
		}

		if (!RSC_TEXT_CHUNK_START_REGEX.test(line)) {
			normalizedLines.push(await normalizeRscRecordLine(line));
			continue;
		}

		const contentLines: string[] = [];
		let nextIndex = index + 1;

		while (nextIndex < lines.length && !RSC_RECORD_START_REGEX.test(lines[nextIndex] ?? '')) {
			contentLines.push(lines[nextIndex] ?? '');
			nextIndex += 1;
		}

		const content = contentLines.join('\n');
		normalizedLines.push(line);
		normalizedLines.push(await normalizeRscTextChunk(content));
		index = nextIndex - 1;
	}

	return normalizedLines.join('\n');
}

async function minifyExportedHtml(html: string): Promise<string> {
	const htmlWithMinifiedScripts = await minifyInlineBlocks(html, 'script');
	const htmlWithMinifiedStyles = await minifyInlineBlocks(htmlWithMinifiedScripts, 'style');

	return htmlWithMinifiedStyles.replace(/>\s+</g, '><').trim();
}

function injectThemeScripts(html: string): string {
	const themeScriptTag = `<script src="${THEME_ASSET_PATH}"></script>`;
	const headCloseIndex = html.indexOf('</head>');

	if (headCloseIndex === -1) {
		return html;
	}

	return `${html.slice(0, headCloseIndex)}${themeScriptTag}${html.slice(headCloseIndex)}`;
}

function injectInitialRscPayload(html: string, rscPayload: string): string {
	const bootstrapScriptMarker = '<script id="_R_">';
	const bootstrapScriptIndex = html.indexOf(bootstrapScriptMarker);

	if (bootstrapScriptIndex === -1) {
		return html;
	}

	const inlineRscPayload = serializeInlineScriptValue({
		params: {},
		rsc: [rscPayload],
	});

	return `${html.slice(0, bootstrapScriptIndex)}<script>self.__VINEXT_RSC__=${inlineRscPayload};</script>${html.slice(bootstrapScriptIndex)}`;
}

function serializeInlineScriptValue(value: unknown): string {
	return JSON.stringify(value)
		.replaceAll('<', '\\u003C')
		.replaceAll('>', '\\u003E')
		.replaceAll('&', '\\u0026');
}

async function normalizeRscRecordLine(line: string): Promise<string> {
	if (line.includes(':HL[')) {
		return line.replaceAll('stylesheet', 'style');
	}

	const recordMatch = line.match(RSC_RECORD_PREFIX_REGEX);
	if (!recordMatch) {
		return line;
	}

	const [, prefix, serializedValue] = recordMatch;
	if (!(serializedValue.startsWith('[') || serializedValue.startsWith('{'))) {
		return line;
	}

	try {
		const parsedValue = JSON.parse(serializedValue) as unknown;
		const normalizedValue = await normalizeRscValue(parsedValue);
		return `${prefix}${JSON.stringify(normalizedValue)}`;
	} catch {
		return line
			.replaceAll('"rel":"stylesheet"', '"rel":"style"')
			.replaceAll('\\"rel\\":\\"stylesheet\\"', '\\"rel\\":\\"style\\"');
	}
}

async function normalizeRscValue(value: unknown): Promise<unknown> {
	if (Array.isArray(value)) {
		if (value[0] === '$' && value[1] === 'script') {
			return await normalizeRscScriptNode(value);
		}

		if (value[0] === '$' && value[1] === 'style') {
			return await normalizeRscStyleNode(value);
		}

		const normalizedItems: unknown[] = [];
		for (const item of value) {
			normalizedItems.push(await normalizeRscValue(item));
		}
		return normalizedItems;
	}

	if (!value || typeof value !== 'object') {
		return value;
	}

	const normalizedEntries = await Promise.all(
		Object.entries(value).map(async ([entryKey, entryValue]) => {
			if (
				entryKey === 'rel' &&
				entryValue === 'stylesheet' &&
				('data-rsc-css-href' in value || 'precedence' in value)
			) {
				return [entryKey, 'style'] as const;
			}

			return [entryKey, await normalizeRscValue(entryValue)] as const;
		})
	);

	return Object.fromEntries(normalizedEntries);
}

async function normalizeRscScriptNode(value: unknown[]): Promise<unknown[]> {
	const normalizedNode = [...value];
	const props = normalizedNode[3];

	if (!props || typeof props !== 'object' || Array.isArray(props)) {
		return normalizedNode;
	}

	const nextProps: Record<string, unknown> = {};
	for (const [entryKey, entryValue] of Object.entries(props)) {
		nextProps[entryKey] = entryValue;
	}

	const scriptType =
		typeof nextProps.type === 'string' ? nextProps.type.toLowerCase() : undefined;

	if (typeof nextProps.children === 'string' && scriptType !== 'application/ld+json') {
		nextProps.children = await minifyInlineBlockContent('script', '', nextProps.children);
	}

	if (
		nextProps.dangerouslySetInnerHTML &&
		typeof nextProps.dangerouslySetInnerHTML === 'object' &&
		!Array.isArray(nextProps.dangerouslySetInnerHTML) &&
		typeof nextProps.dangerouslySetInnerHTML.__html === 'string' &&
		scriptType !== 'application/ld+json'
	) {
		nextProps.dangerouslySetInnerHTML = {
			...nextProps.dangerouslySetInnerHTML,
			__html: await minifyInlineBlockContent(
				'script',
				'',
				nextProps.dangerouslySetInnerHTML.__html
			),
		};
	}

	normalizedNode[3] = await normalizeRscValue(nextProps);
	return normalizedNode;
}

async function normalizeRscStyleNode(value: unknown[]): Promise<unknown[]> {
	const normalizedNode = [...value];
	const props = normalizedNode[3];

	if (!props || typeof props !== 'object' || Array.isArray(props)) {
		return normalizedNode;
	}

	const nextProps: Record<string, unknown> = {};
	for (const [entryKey, entryValue] of Object.entries(props)) {
		nextProps[entryKey] = entryValue;
	}

	if (typeof nextProps.children === 'string') {
		nextProps.children = await minifyInlineBlockContent('style', '', nextProps.children);
	}

	normalizedNode[3] = await normalizeRscValue(nextProps);
	return normalizedNode;
}

async function normalizeRscTextChunk(content: string): Promise<string> {
	const trimmedContent = content.trim();
	if (trimmedContent.length === 0) {
		return '';
	}

	if (looksLikeJavaScriptTextChunk(trimmedContent)) {
		return await minifyInlineBlockContent('script', '', trimmedContent);
	}

	if (looksLikeCssTextChunk(trimmedContent)) {
		return await minifyInlineBlockContent('style', '', trimmedContent);
	}

	return trimmedContent;
}

function looksLikeJavaScriptTextChunk(content: string): boolean {
	return (
		content.startsWith('(()') ||
		content.startsWith('!function') ||
		content.includes('document.') ||
		content.includes('window.') ||
		content.includes('localStorage') ||
		content.includes('matchMedia(')
	);
}

function looksLikeCssTextChunk(content: string): boolean {
	return (
		content.includes('{') &&
		content.includes('}') &&
		(content.includes(':') || content.includes('@keyframes')) &&
		!looksLikeJavaScriptTextChunk(content)
	);
}

async function minifyInlineBlocks(html: string, tagName: 'script' | 'style'): Promise<string> {
	const tagPattern =
		tagName === 'script'
			? /<script([^>]*)>([\s\S]*?)<\/script>/g
			: /<style([^>]*)>([\s\S]*?)<\/style>/g;

	const matches = Array.from(html.matchAll(tagPattern));
	if (matches.length === 0) {
		return html;
	}

	let minifiedHtml = '';
	let lastIndex = 0;

	for (const match of matches) {
		const [fullMatch, attributes, content] = match;
		const matchIndex = match.index ?? 0;

		minifiedHtml += html.slice(lastIndex, matchIndex);

		const nextContent = await minifyInlineBlockContent(tagName, attributes, content);
		minifiedHtml += `<${tagName}${attributes}>${nextContent}</${tagName}>`;

		lastIndex = matchIndex + fullMatch.length;
	}

	minifiedHtml += html.slice(lastIndex);
	return minifiedHtml;
}

async function minifyInlineBlockContent(
	tagName: 'script' | 'style',
	attributes: string,
	content: string
): Promise<string> {
	if (content.trim().length === 0) {
		return '';
	}

	if (tagName === 'script') {
		const normalizedAttributes = attributes.toLowerCase();
		if (
			normalizedAttributes.includes(' src=') ||
			normalizedAttributes.includes('type="application/ld+json"') ||
			normalizedAttributes.includes("type='application/ld+json'")
		) {
			return content.trim();
		}

		const result = await transformWithEsbuild(content, {
			charset: 'utf8',
			loader: 'js',
			minify: true,
			target: 'es2020',
		});
		return result.code.trim();
	}

	const result = await transformWithEsbuild(content, {
		charset: 'utf8',
		loader: 'css',
		minify: true,
		target: 'es2020',
	});
	return result.code.trim();
}
