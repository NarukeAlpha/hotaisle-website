import { useEffect, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { BLOG_POSTS } from '@/generated/blog-data';
import { POLICIES } from '@/generated/static-content-data';

const SITE_NAME = 'Hot Aisle';
const SITE_URL = 'https://hotaisle.xyz';
const DEFAULT_TITLE = 'Hot Aisle - AMD Exclusive AI Cloud';
const DEFAULT_DESCRIPTION =
	'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
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

interface RouteMetadata {
	description?: string;
	image?: string;
	imageAlt?: string;
	keywords?: string;
	title: string;
	type?: 'article' | 'website';
}

const STATIC_ROUTE_METADATA: Record<string, RouteMetadata> = {
	'/': {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		keywords: DEFAULT_KEYWORDS,
	},
	'/about': {
		title: 'About Us | Hot Aisle',
		description:
			'Meet the team behind Hot Aisle and our mission to democratize AMD-powered AI and HPC infrastructure.',
	},
	'/benchmarks-and-analysis': {
		title: 'Benchmarks & Analysis | Hot Aisle',
		description:
			'Performance benchmarks, technical analysis, and real-world results for AMD GPU infrastructure and AI workloads.',
	},
	'/blog': {
		title: 'Blog | Hot Aisle',
		description:
			'Product updates, customer stories, technical guides, and commentary from Hot Aisle.',
	},
	'/cluster': {
		title: 'Cluster Design & Deploy | Hot Aisle',
		description:
			"Unlock the full potential of AI & HPC with Hot Aisle's advanced cluster solutions. Trusted expertise, cutting-edge hardware, and custom consulting.",
		image: `${SITE_URL}/assets/cluster/cluster-powered-by-amd.webp`,
	},
	'/compute': {
		title: 'Compute | Hot Aisle',
		description:
			"Scale your AI training with 192GB HBM3 memory per GPU. Hot Aisle's bare-metal AMD MI300x clusters are built for massive LLM workloads.",
	},
	'/contact': {
		title: 'Contact | Hot Aisle',
		description:
			'Talk to Hot Aisle about AMD GPU cloud, reserved capacity, cluster design, or enterprise deployments.',
	},
	'/datacenter': {
		title: 'Datacenter | Hot Aisle',
		description:
			'Explore the data center foundation behind Hot Aisle: resilient infrastructure, power, cooling, and operations.',
	},
	'/mi300x': {
		title: 'AMD MI300X GPUs | Hot Aisle',
		description:
			'Deploy AMD MI300X GPUs on Hot Aisle for high-memory AI training and inference workloads.',
	},
	'/mi355x': {
		title: 'AMD MI355X GPUs | Hot Aisle',
		description:
			'Reserve next-generation AMD MI355X GPUs on Hot Aisle for demanding AI and HPC workloads.',
	},
	'/networking': {
		title: 'Networking | Hot Aisle',
		description:
			'Learn how Hot Aisle designs high-performance, low-latency networking for GPU clusters and AI infrastructure.',
	},
	'/partners': {
		title: 'Partners | Hot Aisle',
		description:
			'See the hardware, infrastructure, and ecosystem partners helping Hot Aisle deliver AMD-powered AI cloud services.',
	},
	'/policies': {
		title: 'Policies | Hot Aisle',
		description: 'Review the legal, privacy, service, and operational policies for Hot Aisle.',
	},
	'/pricing': {
		title: 'Pricing | Hot Aisle',
		description:
			'Transparent GPU pricing with no hidden fees. Start AMD GPU instances on demand or reserve dedicated capacity.',
	},
	'/quick-start': {
		title: 'Quick Start | Hot Aisle',
		description:
			'Launch on Hot Aisle quickly with setup instructions, access guidance, and first steps for AMD GPU compute.',
	},
};

const BLOG_POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]));
const POLICIES_BY_SLUG = new Map(POLICIES.map((policy) => [policy.slug, policy]));

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

function toAbsoluteUrl(pathOrUrl?: string): string {
	if (!pathOrUrl) {
		return DEFAULT_OG_IMAGE;
	}

	if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
		return pathOrUrl;
	}

	return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function setMetaTag(attribute: 'name' | 'property', key: string, content: string): void {
	let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

	if (!element) {
		element = document.createElement('meta');
		element.setAttribute(attribute, key);
		document.head.append(element);
	}

	element.content = content;
}

function setCanonical(url: string): void {
	let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

	if (!element) {
		element = document.createElement('link');
		element.rel = 'canonical';
		document.head.append(element);
	}

	element.href = url;
}

function resolveMetadata(pathname: string): RouteMetadata {
	const blogMatch = matchPath('/blog/:slug', pathname);
	if (blogMatch?.params.slug) {
		const post = BLOG_POSTS_BY_SLUG.get(blogMatch.params.slug);
		if (post) {
			return {
				title: post.metaTitle ?? `${post.title} | ${SITE_NAME}`,
				description: post.metaDescription ?? post.description ?? DEFAULT_DESCRIPTION,
				keywords: post.metaKeywords ?? DEFAULT_KEYWORDS,
				image: toAbsoluteUrl(post.coverImage),
				imageAlt: post.title,
				type: 'article',
			};
		}
	}

	const policyMatch = matchPath('/policies/:slug', pathname);
	if (policyMatch?.params.slug) {
		const policy = POLICIES_BY_SLUG.get(policyMatch.params.slug);
		if (policy) {
			return {
				title: `${policy.title} | ${SITE_NAME}`,
				description: policy.description ?? DEFAULT_DESCRIPTION,
				keywords: DEFAULT_KEYWORDS,
			};
		}
	}

	return (
		STATIC_ROUTE_METADATA[pathname] ?? {
			title: DEFAULT_TITLE,
			description: DEFAULT_DESCRIPTION,
			keywords: DEFAULT_KEYWORDS,
		}
	);
}

export function HeadMetadata() {
	const location = useLocation();
	const metadata = useMemo(() => resolveMetadata(location.pathname), [location.pathname]);

	useEffect(() => {
		const canonicalUrl = `${SITE_URL}${location.pathname}`;
		const title = metadata.title;
		const description = metadata.description ?? DEFAULT_DESCRIPTION;
		const image = toAbsoluteUrl(metadata.image);
		const imageAlt = metadata.imageAlt ?? `${SITE_NAME} social preview`;
		const keywords = metadata.keywords ?? DEFAULT_KEYWORDS;
		const type = metadata.type ?? 'website';

		document.title = title;
		document.documentElement.lang = 'en';

		setCanonical(canonicalUrl);
		setMetaTag('name', 'description', description);
		setMetaTag('name', 'keywords', keywords);
		setMetaTag('name', 'robots', 'index, follow');
		setMetaTag('property', 'og:type', type);
		setMetaTag('property', 'og:site_name', SITE_NAME);
		setMetaTag('property', 'og:locale', 'en_US');
		setMetaTag('property', 'og:url', canonicalUrl);
		setMetaTag('property', 'og:title', title);
		setMetaTag('property', 'og:description', description);
		setMetaTag('property', 'og:image', image);
		setMetaTag('property', 'og:image:width', '1200');
		setMetaTag('property', 'og:image:height', '630');
		setMetaTag('property', 'og:image:alt', imageAlt);
		setMetaTag('name', 'twitter:card', 'summary_large_image');
		setMetaTag('name', 'twitter:title', title);
		setMetaTag('name', 'twitter:description', description);
		setMetaTag('name', 'twitter:image', image);
	}, [location.pathname, metadata]);

	return null;
}
