import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');
const PUBLIC_BLOG_ASSETS_DIR = path.join(process.cwd(), 'public', 'assets', 'blog');
const GENERATED_OUTPUT_PATH = path.join(process.cwd(), 'src', 'generated', 'blog-data.ts');
const BLOG_ASSET_PREFIX = '/assets/blog/';
const FILE_SUFFIX_REGEX = /\s[0-9a-f]{32}$/i;
const MD_EXTENSION_REGEX = /\.md$/i;
const DATE_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;
const FIRST_MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
const NOTION_NESTED_IMAGE_LINK_REGEX = /!\[\[([^\]]+)\]\(([^)]+)\)\]\(([^)]+)\)/g;
const TAG_LINK_REGEX = /([^,]+?)\s*\(https?:\/\/[^)]+\)/g;
const NOTION_LINK_VALUE_REGEX = /^(.*?)\s*\(https?:\/\/[^)]+\)$/;
const EXTERNAL_OR_SPECIAL_LINK_REGEX = /^(?:https?:|mailto:|tel:|#|\/)/i;
const LEADING_H1_REGEX = /^\s*#\s+(.+)\n+/;
const NOTION_METADATA_LINE_REGEX = /^([A-Za-z][A-Za-z0-9 '&()._/+-]*):\s*(.*)$/;
const MARKDOWN_PARAGRAPH_SPLIT_REGEX = /\n\s*\n/;
const MARKDOWN_INLINE_LINK_REGEX = /\[(.*?)\]\((.*?)\)/g;
const RELATIVE_PATH_PREFIX_REGEX = /^\.\//;
const WINDOWS_PATH_SEPARATOR_REGEX = /\\/g;
const NEW_LINE_SPLIT_REGEX = /\r?\n/;
const IMAGE_EXTENSION_REGEX = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
const NOTION_MULTILINE_METADATA_KEYS = new Set(['description']);
const BLOG_HEADER_IMAGE_BY_SLUG: Record<string, string> = {
	'hot-aisle-achieves-soc-2-type-2-compliance-a-milestone-in-security-and-trust':
		'/assets/blog/hot-aisle-achieves-soc-2-type-2-compliance-a-milestone-in-security-and-trust/header.jpg',
	'soc-2-type-1-completed-hot-aisle-secures-initial-compliance-milestone':
		'/assets/blog/soc-2-type-1-completed-hot-aisle-secures-initial-compliance-milestone/header.jpg',
	'hot-aisle-red-hat-neural-magic-amd-open-ai-inference-mi300x':
		'/assets/blog/hot-aisle-red-hat-neural-magic-amd-open-ai-inference-mi300x/header.jpg',
	'empowering-developers-with-amd-ai-technologies-in-the-cloud':
		'/assets/blog/empowering-developers-with-amd-ai-technologies-in-the-cloud/header.png',
	'hot-aisle-democratizes-ai-with-amd-instinct-mi300x-gpus4o':
		'/assets/blog/hot-aisle-democratizes-ai-with-amd-instinct-mi300x-gpus4o/header.png',
	'hot-aisle-goes-100-green-with-switch-sustainability-certification':
		'/assets/blog/hot-aisle-goes-100-green-with-switch-sustainability-certification/header.jpg',
	'dr-moritz-lehmann-linkedin-hot-aisle-8x-amd-mi300x-fastest-fluidx3d-cfd':
		'/assets/blog/dr-moritz-lehmann-linkedin-hot-aisle-8x-amd-mi300x-fastest-fluidx3d-cfd/header.png',
	'advizex-enables-startup-hot-aisle-to-democratize-access-to-ai-and-supercomputing':
		'/assets/blog/advizex-enables-startup-hot-aisle-to-democratize-access-to-ai-and-supercomputing/header.png',
	'humans-in-ai-podcast-jon-stevens-democratizing-supercomputing':
		'/assets/blog/humans-in-ai-podcast-jon-stevens-democratizing-supercomputing/header.png',
	'response-to-ai-is-the-spark-igniting-a-new-era':
		'/assets/blog/response-to-ai-is-the-spark-igniting-a-new-era/header.jpg',
	'saurabh-kapoor-dell-technologies-jon-stevens-sc24-thecube':
		'/assets/blog/saurabh-kapoor-dell-technologies-jon-stevens-sc24-thecube/header.png',
	'jon-stevens-speaking-dell-technologies-sc24':
		'/assets/blog/jon-stevens-speaking-dell-technologies-sc24/header.png',
	hyperscalers: '/assets/blog/hyperscalers/header.jpg',
	groundbreaking: '/assets/blog/groundbreaking/header.jpg',
	cruising: '/assets/blog/cruising/header.jpg',
};

interface RawBlogPost {
	author?: string;
	contentMarkdown: string;
	coverImage?: string;
	date: string;
	description: string;
	metaDescription?: string;
	metaKeywords?: string;
	metaTitle?: string;
	published: boolean;
	slug: string;
	sourceFileName: string;
	tags: string[];
	title: string;
}

interface ParsedNotionMarkdown {
	contentMarkdown: string;
	metadata: Record<string, string>;
	title: string;
}

interface GeneratedBlogPost {
	author?: string;
	contentHtml: string;
	coverImage?: string;
	date: string;
	description: string;
	metaDescription?: string;
	metaKeywords?: string;
	metaTitle?: string;
	slug: string;
	tags: string[];
	title: string;
}

function normalizeMetadataKey(key: string): string {
	return key.trim().toLowerCase();
}

function normalizeFileStem(fileName: string): string {
	const withoutExtension = fileName.replace(MD_EXTENSION_REGEX, '');
	return withoutExtension.replace(FILE_SUFFIX_REGEX, '').trim();
}

function slugify(input: string): string {
	const cleaned = input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, ' ')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

	return cleaned || 'untitled';
}

function parseBooleanFlag(value: string | undefined, fallback: boolean): boolean {
	if (!value) {
		return fallback;
	}

	const normalized = value.trim().toLowerCase();
	if (normalized === 'yes' || normalized === 'true') {
		return true;
	}
	if (normalized === 'no' || normalized === 'false') {
		return false;
	}
	return fallback;
}

function parseDateToIso(value: string | undefined): string {
	if (!value) {
		return new Date(0).toISOString();
	}

	const match = value.trim().match(DATE_REGEX);
	if (!match) {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString();
		}
		return new Date(0).toISOString();
	}

	const [, monthRaw, dayRaw, yearRaw] = match;
	const month = Number.parseInt(monthRaw, 10);
	const day = Number.parseInt(dayRaw, 10);
	const year = Number.parseInt(yearRaw, 10);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	if (Number.isNaN(parsed.getTime())) {
		return new Date(0).toISOString();
	}
	return parsed.toISOString();
}

function stripNotionLinkValue(value: string | undefined): string | undefined {
	if (!value) {
		return undefined;
	}

	const match = value.trim().match(NOTION_LINK_VALUE_REGEX);
	if (!match) {
		return value.trim();
	}

	return match[1].trim();
}

function parseTags(value: string | undefined): string[] {
	if (!value) {
		return [];
	}

	const tags: string[] = [];
	const fromLinks = value.matchAll(TAG_LINK_REGEX);
	for (const match of fromLinks) {
		const tag = match[1]?.trim();
		if (tag) {
			tags.push(tag);
		}
	}

	if (tags.length > 0) {
		return tags;
	}

	return value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function extractDescription(contentMarkdown: string): string {
	const noHeadings = contentMarkdown.replace(/^#+\s+/gm, '').trim();
	const firstParagraph = noHeadings.split(MARKDOWN_PARAGRAPH_SPLIT_REGEX)[0] ?? '';
	const plain = firstParagraph.replace(MARKDOWN_INLINE_LINK_REGEX, '$1').trim();
	if (plain.length <= 220) {
		return plain;
	}
	return `${plain.slice(0, 217).trimEnd()}...`;
}

function stripLeadingMatchingHeading(contentMarkdown: string, title: string): string {
	const match = contentMarkdown.match(LEADING_H1_REGEX);
	if (!match) {
		return contentMarkdown;
	}

	const headingText = match[1].replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
	const normalizedTitle = title.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

	if (headingText !== normalizedTitle) {
		return contentMarkdown;
	}

	return contentMarkdown.replace(LEADING_H1_REGEX, '');
}

function decodeMarkdownPath(rawPath: string): string {
	const trimmed = rawPath.trim().replace(/^<|>$/g, '');
	try {
		return decodeURIComponent(trimmed);
	} catch {
		return trimmed;
	}
}

function isLikelyImageReference(source: string): boolean {
	const decoded = decodeMarkdownPath(source);
	if (!EXTERNAL_OR_SPECIAL_LINK_REGEX.test(decoded)) {
		return true;
	}
	return IMAGE_EXTENSION_REGEX.test(decoded);
}

function toAssetUrl(assetPath: string): string {
	const normalized = assetPath
		.replace(RELATIVE_PATH_PREFIX_REGEX, '')
		.replace(WINDOWS_PATH_SEPARATOR_REGEX, '/');
	const encoded = normalized
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	return `${BLOG_ASSET_PREFIX}${encoded}`;
}

function parseNotionMetadataLine(line: string): { key: string; value: string } | null {
	const metadataLineMatch = line.match(NOTION_METADATA_LINE_REGEX);
	if (!metadataLineMatch) {
		return null;
	}

	return {
		key: normalizeMetadataKey(metadataLineMatch[1]),
		value: metadataLineMatch[2]?.trim() ?? '',
	};
}

function appendMultilineMetadataValue(
	metadata: Record<string, string>,
	key: string,
	line: string
): void {
	const previousValue = metadata[key] ?? '';
	metadata[key] = previousValue ? `${previousValue}\n${line}` : line;
}

function canContinueMultilineMetadata(key: string | null, trimmedLine: string): boolean {
	if (!key) {
		return false;
	}
	if (!NOTION_MULTILINE_METADATA_KEYS.has(key)) {
		return false;
	}
	return !trimmedLine.startsWith('#');
}

function parseNotionMarkdown(fileContents: string): ParsedNotionMarkdown {
	const lines = fileContents.split(NEW_LINE_SPLIT_REGEX);
	let lineIndex = 0;
	let title = '';

	if (lines[0]?.startsWith('# ')) {
		title = lines[0].slice(2).trim();
		lineIndex = 1;
	}

	while (lineIndex < lines.length && lines[lineIndex]?.trim() === '') {
		lineIndex += 1;
	}

	const metadata: Record<string, string> = {};
	let currentMetadataKey: string | null = null;
	while (lineIndex < lines.length) {
		const line = lines[lineIndex] ?? '';
		const trimmedLine = line.trim();
		const parsedMetadataLine = parseNotionMetadataLine(line);
		if (parsedMetadataLine) {
			metadata[parsedMetadataLine.key] = parsedMetadataLine.value;
			currentMetadataKey = parsedMetadataLine.key;
			lineIndex += 1;
			continue;
		}

		if (!currentMetadataKey) {
			if (trimmedLine === '') {
				lineIndex += 1;
				continue;
			}
			break;
		}

		if (canContinueMultilineMetadata(currentMetadataKey, trimmedLine)) {
			appendMultilineMetadataValue(metadata, currentMetadataKey, line);
			lineIndex += 1;
			continue;
		}

		if (trimmedLine === '') {
			lineIndex += 1;
			continue;
		}

		lineIndex += 1;
		break;
	}

	const contentMarkdown = lines.slice(lineIndex).join('\n').trim();

	return {
		title,
		metadata,
		contentMarkdown,
	};
}

function parseBlogFile(fileName: string, fileContents: string): RawBlogPost {
	const parsedMatter = matter(fileContents);
	const frontmatter = parsedMatter.data as Record<string, unknown>;
	const hasFrontmatter = Object.keys(frontmatter).length > 0;
	const parsed = hasFrontmatter
		? {
				title: String(frontmatter.title ?? ''),
				metadata: Object.fromEntries(
					Object.entries(frontmatter).map(([key, value]) => [
						normalizeMetadataKey(key),
						String(value ?? ''),
					])
				),
				contentMarkdown: parsedMatter.content.trim(),
			}
		: parseNotionMarkdown(fileContents);

	const sourceStem = normalizeFileStem(fileName);
	const metadataSlug = parsed.metadata.slug?.trim();
	const slug = slugify(metadataSlug || sourceStem);
	const title = parsed.title || parsed.metadata.title || sourceStem;
	const published = parseBooleanFlag(parsed.metadata.publish, true);
	const description =
		parsed.metadata.description?.trim() || extractDescription(parsed.contentMarkdown);
	const tags = parseTags(parsed.metadata.tags);
	const author = stripNotionLinkValue(parsed.metadata.author);
	const date = parseDateToIso(parsed.metadata.date);
	const withoutDuplicateHeading = stripLeadingMatchingHeading(
		parsed.contentMarkdown,
		title
	).trim();
	const normalizedContent = withoutDuplicateHeading || parsed.contentMarkdown;

	const imageMatches = normalizedContent.matchAll(MARKDOWN_IMAGE_REGEX);
	let coverImagePath: string | undefined;
	for (const imageMatch of imageMatches) {
		const source = imageMatch[2];
		if (!(source && isLikelyImageReference(source))) {
			continue;
		}
		coverImagePath = decodeMarkdownPath(source);
		break;
	}
	if (!coverImagePath) {
		const coverMatch = normalizedContent.match(FIRST_MARKDOWN_IMAGE_REGEX);
		coverImagePath = coverMatch?.[2] ? decodeMarkdownPath(coverMatch[2]) : undefined;
	}
	const coverImage =
		coverImagePath && !EXTERNAL_OR_SPECIAL_LINK_REGEX.test(coverImagePath)
			? toAssetUrl(coverImagePath)
			: coverImagePath;
	const overriddenCoverImage = BLOG_HEADER_IMAGE_BY_SLUG[slug] ?? coverImage;

	return {
		slug,
		title,
		description,
		author,
		date,
		tags,
		published,
		metaTitle: parsed.metadata['meta title'],
		metaDescription: parsed.metadata['meta description'],
		metaKeywords: parsed.metadata['meta keywords'],
		contentMarkdown: normalizedContent,
		coverImage: overriddenCoverImage,
		sourceFileName: fileName,
	};
}

function resolveInternalMarkdownLink(rawPath: string, fileStemToSlug: Map<string, string>): string {
	const decoded = decodeMarkdownPath(rawPath);
	if (EXTERNAL_OR_SPECIAL_LINK_REGEX.test(decoded)) {
		return rawPath;
	}

	if (decoded.toLowerCase().endsWith('.md')) {
		const fileName = path.basename(decoded);
		const stem = normalizeFileStem(fileName).toLowerCase();
		const slug = fileStemToSlug.get(stem);
		if (slug) {
			return `/blog/${slug}`;
		}

		return `/blog/${slugify(stem)}`;
	}

	return toAssetUrl(decoded);
}

function rewriteMarkdownLinks(markdown: string, fileStemToSlug: Map<string, string>): string {
	const normalizedNestedImages = markdown.replaceAll(
		NOTION_NESTED_IMAGE_LINK_REGEX,
		(_match, label, _linkPath, imagePath) => `![${label}](${imagePath})`
	);

	const withImages = normalizedNestedImages.replaceAll(
		MARKDOWN_IMAGE_REGEX,
		(_match, alt, rawPath) => {
			const resolvedPath = resolveInternalMarkdownLink(rawPath, fileStemToSlug);
			return `![${alt}](<${resolvedPath}>)`;
		}
	);

	return withImages.replaceAll(MARKDOWN_LINK_REGEX, (match, label, rawPath) => {
		if (match.startsWith('![')) {
			return match;
		}

		const decoded = decodeMarkdownPath(rawPath);
		if (EXTERNAL_OR_SPECIAL_LINK_REGEX.test(decoded)) {
			return `[${label}](${rawPath})`;
		}

		const resolvedPath = resolveInternalMarkdownLink(rawPath, fileStemToSlug);
		return `[${label}](${resolvedPath})`;
	});
}

async function renderMarkdown(markdown: string): Promise<string> {
	const processedContent = await remark().use(remarkGfm).use(html).process(markdown);
	return processedContent.toString();
}

async function copyBlogAssets(
	sourceDirectory: string,
	destinationDirectory: string
): Promise<void> {
	if (!fs.existsSync(sourceDirectory)) {
		return;
	}

	await fs.promises.mkdir(destinationDirectory, { recursive: true });
	const entries = await fs.promises.readdir(sourceDirectory, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = path.join(sourceDirectory, entry.name);
		const destinationPath = path.join(destinationDirectory, entry.name);

		if (entry.isDirectory()) {
			await copyBlogAssets(sourcePath, destinationPath);
			continue;
		}

		if (entry.name.endsWith('.md')) {
			continue;
		}

		await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
		await fs.promises.copyFile(sourcePath, destinationPath);
	}
}

async function generateBlogData(): Promise<void> {
	const posts: RawBlogPost[] = [];
	const fileStemToSlug = new Map<string, string>();

	if (fs.existsSync(BLOG_DIR)) {
		const files = fs.readdirSync(BLOG_DIR).filter((fileName) => fileName.endsWith('.md'));
		for (const fileName of files) {
			const fullPath = path.join(BLOG_DIR, fileName);
			const fileContents = fs.readFileSync(fullPath, 'utf8');
			const parsed = parseBlogFile(fileName, fileContents);
			if (!parsed.published) {
				continue;
			}
			posts.push(parsed);
			fileStemToSlug.set(normalizeFileStem(fileName).toLowerCase(), parsed.slug);
		}
	}

	const renderedPosts: GeneratedBlogPost[] = [];
	for (const post of posts) {
		const rewrittenMarkdown = rewriteMarkdownLinks(post.contentMarkdown, fileStemToSlug);
		const contentHtml = await renderMarkdown(rewrittenMarkdown);
		renderedPosts.push({
			slug: post.slug,
			title: post.title,
			description: post.description,
			contentHtml,
			date: post.date,
			tags: post.tags,
			author: post.author,
			coverImage: post.coverImage,
			metaTitle: post.metaTitle,
			metaDescription: post.metaDescription,
			metaKeywords: post.metaKeywords,
		});
	}

	renderedPosts.sort(
		(left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
	);

	const fileContents = `/* eslint-disable */
// This file is auto-generated by scripts/generate_blog_data.ts.
// Do not edit by hand.

export interface GeneratedBlogPost {
	author?: string;
	contentHtml: string;
	coverImage?: string;
	date: string;
	description: string;
	metaDescription?: string;
	metaKeywords?: string;
	metaTitle?: string;
	slug: string;
	tags: string[];
	title: string;
}

export const BLOG_POSTS: GeneratedBlogPost[] = ${JSON.stringify(renderedPosts, null, 2)};
`;

	await fs.promises.mkdir(path.dirname(GENERATED_OUTPUT_PATH), { recursive: true });
	await fs.promises.writeFile(GENERATED_OUTPUT_PATH, fileContents, 'utf8');
	await copyBlogAssets(BLOG_DIR, PUBLIC_BLOG_ASSETS_DIR);
}

try {
	await generateBlogData();
	console.log('Generated blog data and copied blog assets.');
} catch (error) {
	console.error('Failed to generate blog data.');
	throw error;
}
