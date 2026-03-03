import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BLOG_POSTS, type GeneratedBlogPost } from '@/generated/blog-data';

const SITE_NAME = 'Hot Aisle';
const SITE_URL = 'https://hotaisle.xyz';
const DEFAULT_KEYWORDS = [
	'AMD',
	'MI300X',
	'MI355X',
	'GPU cloud',
	'AI compute',
	'machine learning',
	'deep learning',
	'AMD Instinct',
].join(', ');
const DIST_DIR = path.join(process.cwd(), 'dist');
const DIST_INDEX_PATH = path.join(DIST_DIR, 'index.html');
const TITLE_TAG_REGEX = /<title>.*?<\/title>/;

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

function toAbsoluteUrl(pathOrUrl?: string): string {
	if (!pathOrUrl) {
		return `${SITE_URL}/og-image.png`;
	}

	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}

	return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function buildHeadMarkup(post: GeneratedBlogPost): string {
	const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
	const description = post.metaDescription ?? post.description;
	const title = post.metaTitle ?? `${post.title} | ${SITE_NAME}`;
	const image = toAbsoluteUrl(post.coverImage);
	const keywords = post.metaKeywords ?? DEFAULT_KEYWORDS;
	const publishedTime = post.date;

	return [
		`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
		`<meta name="description" content="${escapeHtml(description)}">`,
		`<meta name="keywords" content="${escapeHtml(keywords)}">`,
		'<meta name="robots" content="index, follow">',
		'<meta property="og:type" content="article">',
		`<meta property="og:site_name" content="${SITE_NAME}">`,
		'<meta property="og:locale" content="en_US">',
		`<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
		`<meta property="og:title" content="${escapeHtml(title)}">`,
		`<meta property="og:description" content="${escapeHtml(description)}">`,
		`<meta property="og:image" content="${escapeHtml(image)}">`,
		'<meta property="og:image:width" content="1200">',
		'<meta property="og:image:height" content="630">',
		`<meta property="og:image:alt" content="${escapeHtml(post.title)}">`,
		`<meta property="article:published_time" content="${escapeHtml(publishedTime)}">`,
		`<meta property="article:author" content="${escapeHtml(post.author ?? SITE_NAME)}">`,
		`<meta name="twitter:card" content="summary_large_image">`,
		`<meta name="twitter:title" content="${escapeHtml(title)}">`,
		`<meta name="twitter:description" content="${escapeHtml(description)}">`,
		`<meta name="twitter:image" content="${escapeHtml(image)}">`,
		`<meta name="twitter:image:alt" content="${escapeHtml(post.title)}">`,
	].join('\n\t\t');
}

async function writeBlogHtml(post: GeneratedBlogPost, templateHtml: string): Promise<void> {
	const title = post.metaTitle ?? `${post.title} | ${SITE_NAME}`;
	const headMarkup = buildHeadMarkup(post);
	const htmlWithTitle = templateHtml.replace(
		TITLE_TAG_REGEX,
		`<title>${escapeHtml(title)}</title>`
	);
	const outputHtml = htmlWithTitle.replace('</head>', `\t\t${headMarkup}\n\t</head>`);
	const outputDir = path.join(DIST_DIR, 'blog', post.slug);
	const outputPath = path.join(outputDir, 'index.html');

	await mkdir(outputDir, { recursive: true });
	await writeFile(outputPath, outputHtml);
}

async function main(): Promise<void> {
	const templateHtml = await readFile(DIST_INDEX_PATH, 'utf8');

	for (const post of BLOG_POSTS) {
		await writeBlogHtml(post, templateHtml);
	}

	console.log(`Generated ${BLOG_POSTS.length} blog HTML files with per-post metadata.`);
}

await main();
