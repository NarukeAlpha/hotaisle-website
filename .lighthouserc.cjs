const LIGHTHOUSE_MODE = process.env.LIGHTHOUSE_MODE ?? 'pr';
const LOCAL_BASE_URL = 'http://localhost';
const PRODUCTION_BASE_URL = 'https://hotaisle.xyz';
const NUMBER_OF_RUNS = 3;
const PAGE_PATHS = ['/', '/compute/', '/pricing/', '/quick-start/', '/mi300x/'];

if (!['pr', 'prod'].includes(LIGHTHOUSE_MODE)) {
	throw new Error(`Unsupported LIGHTHOUSE_MODE: ${LIGHTHOUSE_MODE}`);
}

const baseUrl = LIGHTHOUSE_MODE === 'prod' ? PRODUCTION_BASE_URL : LOCAL_BASE_URL;
const collect = {
	numberOfRuns: NUMBER_OF_RUNS,
	url: PAGE_PATHS.map((pagePath) => new URL(pagePath, baseUrl).toString()),
	settings: {
		preset: 'desktop',
		chromeFlags: '--no-sandbox',
	},
};

if (LIGHTHOUSE_MODE === 'pr') {
	collect.staticDistDir = './dist-static';
}

module.exports = {
	ci: {
		collect,
		assert: {
			preset: 'lighthouse:recommended',
			assertions: {
				'categories:accessibility': [
					'error',
					{
						minScore: 0.9,
					},
				],
				'categories:best-practices': [
					'error',
					{
						minScore: 0.9,
					},
				],
				'categories:seo': [
					'error',
					{
						minScore: 0.9,
					},
				],
				// Keep performance warning-only until the scheduled production runs give us a stable baseline.
				'categories:performance': [
					'warn',
					{
						aggregationMethod: 'median',
						minScore: 0.7,
					},
				],
				// These phase-1 warnings seed concrete metrics now so we can promote stable thresholds later.
				'largest-contentful-paint': [
					'warn',
					{
						aggregationMethod: 'median',
						maxNumericValue: 2500,
					},
				],
				'image-delivery-insight': 'warn',
				'cumulative-layout-shift': [
					'warn',
					{
						aggregationMethod: 'median',
						maxNumericValue: 0.1,
					},
				],
				'total-blocking-time': [
					'warn',
					{
						aggregationMethod: 'median',
						maxNumericValue: 200,
					},
				],
				'uses-responsive-images': 'warn',
				'lcp-discovery-insight': 'warn',
				'network-dependency-tree-insight': 'warn',
				'color-contrast': 'warn',
				'render-blocking-insight': 'warn',
				'render-blocking-resources': 'warn',
			},
		},
		upload: {
			target: 'filesystem',
			outputDir: `.lighthouseci/${LIGHTHOUSE_MODE}`,
		},
	},
};
