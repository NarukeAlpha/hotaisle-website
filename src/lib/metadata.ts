const SITE_NAME = 'Hot Aisle';
const SITE_URL = 'https://hotaisle.xyz';
const DEFAULT_IMAGE = '/hotaisle-logo.png';
const DEFAULT_IMAGE_ALT = 'Hot Aisle';

interface PageMetadataOptions {
	description: string;
	image?: string;
	imageAlt?: string;
	path: string;
	title: string;
	type?: 'article' | 'website';
}

export function createPageMetadata({
	description,
	image = DEFAULT_IMAGE,
	imageAlt = DEFAULT_IMAGE_ALT,
	path,
	title,
	type = 'website',
}: PageMetadataOptions) {
	const url = new URL(path, SITE_URL).toString();

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type,
			url,
			siteName: SITE_NAME,
			images: [
				{
					alt: imageAlt,
					url: image,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
		},
	};
}
