import { spawn } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { minify as minifyWithRolldown } from 'rolldown/utils';
import { appRouter } from '../node_modules/vinext/dist/routing/app-router.js';
import { BLOG_POSTS } from '../src/generated/blog-data.ts';
import { POLICIES } from '../src/generated/static-content-data.ts';

const EXPORT_ORIGIN = 'https://static.hotaisle.local';
const HTML_CLOSE_TAG = '</html>';
const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const DIST_DIRECTORY = path.join(PROJECT_ROOT, 'dist');
const STATIC_DIST_DIRECTORY = path.join(PROJECT_ROOT, 'dist-static');
const CLIENT_DIRECTORY = path.join(DIST_DIRECTORY, 'client');
const APP_DIRECTORY = path.join(PROJECT_ROOT, 'src', 'app');
const SERVER_ENTRY_PATH = path.join(DIST_DIRECTORY, 'server', 'index.js');
const INLINE_SCRIPT_FILE_NAME = 'inline-script.js';
const DS_STORE_FILE_NAME = '.DS_Store';
const VITE_METADATA_DIRECTORY_NAME = '.vite';
const WRANGLER_CONFIG_FILE_NAME = 'wrangler.json';
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECT_HOPS = 10;
const PRE_BLOCK_REGEX = /<pre\b[^>]*>[\s\S]*?<\/pre>/gi;
interface CssSegment {
	isString: boolean;
	value: string;
}

process.env.NODE_ENV = 'production';

await rm(STATIC_DIST_DIRECTORY, { force: true, recursive: true });

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

await cp(CLIENT_DIRECTORY, STATIC_DIST_DIRECTORY, {
	filter: (sourcePath: string) => !shouldExcludeFromStaticExport(sourcePath),
	force: true,
	recursive: true,
});

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
	const html = await normalizeExportedHtml(rawHtml);
	const outputPath = toOutputPath(routePath);
	const fullPath = path.join(STATIC_DIST_DIRECTORY, outputPath);

	await mkdir(path.dirname(fullPath), { recursive: true });
	await writeFile(fullPath, html, 'utf8');
}

await scrubExportedHtmlFiles(STATIC_DIST_DIRECTORY);

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

async function normalizeExportedHtml(html: string): Promise<string> {
	const htmlDocument = stripTrailingContentAfterHtml(html);
	const htmlWithoutClientBootstrap = stripClientBootstrap(htmlDocument);

	return await minifyExportedHtml(htmlWithoutClientBootstrap);
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

async function minifyExportedHtml(html: string): Promise<string> {
	const htmlWithMinifiedScripts = await minifyInlineBlocks(html, 'script');
	const htmlWithMinifiedStyles = await minifyInlineBlocks(htmlWithMinifiedScripts, 'style');

	return collapseInterTagWhitespaceOutsidePre(htmlWithMinifiedStyles).trim();
}

function collapseInterTagWhitespaceOutsidePre(html: string): string {
	const preservedPreBlocks: string[] = [];
	let protectedHtml = html;

	protectedHtml = protectedHtml.replace(PRE_BLOCK_REGEX, (preBlock: string) => {
		const placeholder = `__HOTAISLE_PRE_BLOCK_${preservedPreBlocks.length}__`;
		preservedPreBlocks.push(preBlock);
		return placeholder;
	});

	let restoredHtml = protectedHtml.replace(/>\s+</g, '><');

	for (const [index, preBlock] of preservedPreBlocks.entries()) {
		const placeholder = `__HOTAISLE_PRE_BLOCK_${index}__`;
		restoredHtml = restoredHtml.replace(placeholder, preBlock);
	}

	return restoredHtml;
}

function stripClientBootstrap(html: string): string {
	return html
		.replace(/<link rel="preload" href="\/assets\/index-[^"]+\.css" as="style"\/>/g, '')
		.replace(
			/<link rel="modulepreload" href="\/assets\/[^"]+\.js"(?: crossorigin="")?\s*\/>/g,
			''
		)
		.replace(/<script>self\.__VINEXT_RSC_PARAMS__=.*?<\/script>/g, '')
		.replace(/<script>self\.__VINEXT_RSC_NAV__=.*?<\/script>/g, '')
		.replace(/<script id="_R_">[\s\S]*?<\/script>/g, '');
}

async function scrubExportedHtmlFiles(directory: string): Promise<void> {
	const directoryEntries = await readdir(directory, { withFileTypes: true });

	for (const directoryEntry of directoryEntries) {
		const entryPath = path.join(directory, directoryEntry.name);

		if (directoryEntry.isDirectory()) {
			await scrubExportedHtmlFiles(entryPath);
			continue;
		}

		if (!(directoryEntry.isFile() && entryPath.endsWith('.html'))) {
			continue;
		}

		const html = await readFile(entryPath, 'utf8');
		const strippedHtml = stripClientBootstrap(html);

		if (strippedHtml !== html) {
			await writeFile(entryPath, strippedHtml, 'utf8');
		}
	}
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

		return await minifyInlineScript(content);
	}

	return minifyInlineCss(content);
}

async function minifyInlineScript(content: string): Promise<string> {
	const result = await minifyWithRolldown(INLINE_SCRIPT_FILE_NAME, content, {
		module: false,
	});

	if (result.errors.length > 0) {
		const [firstError] = result.errors;
		throw new Error(firstError?.message ?? 'Rolldown failed to minify inline script');
	}

	return result.code.trim();
}

function minifyInlineCss(content: string): string {
	const cssSegments = splitCssSegments(content);
	let minifiedCss = '';

	for (const cssSegment of cssSegments) {
		minifiedCss += cssSegment.isString ? cssSegment.value : minifyCssSegment(cssSegment.value);
	}

	return minifiedCss.trim();
}

function splitCssSegments(content: string): CssSegment[] {
	const segments: CssSegment[] = [];
	let index = 0;
	let segmentStart = 0;

	while (index < content.length) {
		const character = content[index] ?? '';
		const nextCharacter = content[index + 1] ?? '';

		if (isCssCommentStart(character, nextCharacter)) {
			pushCssSegment(segments, false, content.slice(segmentStart, index));
			index = skipCssComment(content, index + 2);
			segmentStart = index;
			continue;
		}

		if (isCssStringDelimiter(character)) {
			pushCssSegment(segments, false, content.slice(segmentStart, index));
			const stringEnd = findCssStringEnd(content, index + 1, character);
			pushCssSegment(segments, true, content.slice(index, stringEnd));
			index = stringEnd;
			segmentStart = index;
			continue;
		}

		index += 1;
	}

	pushCssSegment(segments, false, content.slice(segmentStart));

	return segments;
}

function pushCssSegment(segments: CssSegment[], isString: boolean, value: string): void {
	if (value.length === 0) {
		return;
	}

	segments.push({ isString, value });
}

function isCssCommentStart(character: string, nextCharacter: string): boolean {
	return character === '/' && nextCharacter === '*';
}

function isCssStringDelimiter(character: string): character is '"' | "'" {
	return character === '"' || character === "'";
}

function skipCssComment(content: string, index: number): number {
	let nextIndex = index;

	while (nextIndex < content.length) {
		const character = content[nextIndex] ?? '';
		const nextCharacter = content[nextIndex + 1] ?? '';

		if (character === '*' && nextCharacter === '/') {
			return nextIndex + 2;
		}

		nextIndex += 1;
	}

	return nextIndex;
}

function findCssStringEnd(content: string, index: number, delimiter: '"' | "'"): number {
	let nextIndex = index;

	while (nextIndex < content.length) {
		const character = content[nextIndex] ?? '';
		if (character === '\\') {
			nextIndex += 2;
			continue;
		}

		if (character === delimiter) {
			return nextIndex + 1;
		}

		nextIndex += 1;
	}

	return nextIndex;
}

function minifyCssSegment(segment: string): string {
	return segment
		.replace(/\s+/g, ' ')
		.replace(/\s*([{}:;,>+~()])\s*/g, '$1')
		.replace(/;}/g, '}');
}

function shouldExcludeFromStaticExport(sourcePath: string): boolean {
	const entryName = path.basename(sourcePath);
	return (
		entryName === DS_STORE_FILE_NAME ||
		entryName === VITE_METADATA_DIRECTORY_NAME ||
		entryName === WRANGLER_CONFIG_FILE_NAME
	);
}
