const SITE_NAME = 'Hot Aisle';
const SITE_URL = 'https://hotaisle.xyz';
const SITE_LOCALE = 'en_US';
const DEFAULT_IMAGE = '/assets/og/hot-aisle-share.png';
const DEFAULT_IMAGE_ALT = 'Hot Aisle branded share image';
const DEFAULT_IMAGE_WIDTH = 1200;
const DEFAULT_IMAGE_HEIGHT = 630;

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
		alternates: {
			canonical: url,
		},
		openGraph: {
			title,
			description,
			locale: SITE_LOCALE,
			type,
			url,
			siteName: SITE_NAME,
			images: [
				{
					alt: imageAlt,
					height: DEFAULT_IMAGE_HEIGHT,
					url: image,
					width: DEFAULT_IMAGE_WIDTH,
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
