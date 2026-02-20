import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import { BLOG_POSTS } from '@/generated/blog-data';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const MD_EXTENSION_REGEX = /\.md$/i;

export interface PageData {
	author?: string;
	contentHtml: string;
	coverImage?: string;
	date?: string;
	description?: string;
	metaDescription?: string;
	metaKeywords?: string;
	metaTitle?: string;
	slug: string;
	tags?: string[];
	title: string;
}

export type BlogPost = PageData & {
	date: string;
	tags?: string[];
	coverImage?: string;
};

async function renderMarkdown(markdown: string): Promise<string> {
	const processedContent = await remark().use(remarkGfm).use(html).process(markdown);
	return processedContent.toString();
}

const BLOG_POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]));

export async function getPageContent(
	category: 'pages' | 'policies' | 'blog',
	slug: string
): Promise<PageData | null> {
	if (category === 'blog') {
		return BLOG_POSTS_BY_SLUG.get(slug) ?? null;
	}

	const fullPath = path.join(CONTENT_DIR, category, `${slug}.md`);
	if (!fs.existsSync(fullPath)) {
		return null;
	}

	const fileContents = fs.readFileSync(fullPath, 'utf8');
	const { data, content } = matter(fileContents);
	const contentHtml = await renderMarkdown(content);
	const title = String(data.title ?? slug);
	const description = data.description ? String(data.description) : undefined;
	const hasDistinctDescription =
		description && description.trim().toLowerCase() !== title.trim().toLowerCase();

	return {
		slug,
		title,
		description: hasDistinctDescription ? description : undefined,
		contentHtml,
	};
}

export function getAllSlugs(category: 'pages' | 'policies' | 'blog'): string[] {
	if (category === 'blog') {
		return BLOG_POSTS.map((post) => post.slug);
	}

	const dir = path.join(CONTENT_DIR, category);
	if (!fs.existsSync(dir)) {
		return [];
	}

	const files = fs.readdirSync(dir);
	return files.map((fileName) => fileName.replace(MD_EXTENSION_REGEX, ''));
}

export function getAllBlogPosts(): Promise<BlogPost[]> {
	const sortedPosts = [...BLOG_POSTS].sort(
		(left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
	);
	return Promise.resolve(sortedPosts);
}
