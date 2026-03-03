import { getAllSlugs } from '@/lib/content';

interface SitemapEntry {
	changeFrequency: 'monthly' | 'weekly' | 'yearly';
	lastModified: Date;
	priority: number;
	url: string;
}

export default function sitemap(): SitemapEntry[] {
	const baseUrl = 'https://hotaisle.xyz';

	// Static routes
	const staticRoutes = [
		'',
		'/compute',
		'/datacenter',
		'/networking',
		'/storage',
		'/pricing',
		'/partners',
		'/cluster',
		'/quick-start',
		'/benchmarks-and-analysis',
		'/mi300x',
		'/mi355x',
		'/blog',
		'/policies',
		'/about',
		'/contact',
	].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: route === '' ? 1.0 : 0.8,
	}));

	// Blog Posts
	const blogSlugs = getAllSlugs('blog');
	const blogRoutes = blogSlugs.map((slug) => ({
		url: `${baseUrl}/blog/${slug}`,
		lastModified: new Date(),
		changeFrequency: 'monthly' as const,
		priority: 0.6,
	}));

	// Policies
	const policySlugs = getAllSlugs('policies');
	const policyRoutes = policySlugs.map((slug) => ({
		url: `${baseUrl}/policies/${slug}`,
		lastModified: new Date(),
		changeFrequency: 'yearly' as const,
		priority: 0.5,
	}));

	return [...staticRoutes, ...blogRoutes, ...policyRoutes];
}
