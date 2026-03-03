interface RobotsConfig {
	rules: {
		allow: string;
		userAgent: string;
	};
	sitemap: string;
}

export default function robots(): RobotsConfig {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: 'https://hotaisle.xyz/sitemap.xml',
	};
}
