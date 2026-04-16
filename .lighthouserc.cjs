const LIGHTHOUSE_MODE = process.env.LIGHTHOUSE_MODE ?? 'pr';
const LIGHTHOUSE_ENFORCE_CORE_METRICS = process.env.LIGHTHOUSE_ENFORCE_CORE_METRICS === 'true';
const LIGHTHOUSE_NUMBER_OF_RUNS = 2;
const LIGHTHOUSE_PAGE_PATHS = ['/', '/pricing/', '/quick-start/', '/mi300x/'];
const LIGHTHOUSE_BASE_URLS = {
	pr: 'http://localhost',
	prod: 'https://hotaisle.xyz',
};
const SUPPORTED_LIGHTHOUSE_MODES = new Set(Object.keys(LIGHTHOUSE_BASE_URLS));

if (!SUPPORTED_LIGHTHOUSE_MODES.has(LIGHTHOUSE_MODE)) {
	throw new Error(`Unsupported LIGHTHOUSE_MODE: ${LIGHTHOUSE_MODE}`);
}

const createMedianAssertion = (level, options) => [
	level,
	{
		aggregationMethod: 'median',
		...options,
	},
];
// Set LIGHTHOUSE_ENFORCE_CORE_METRICS=true to fail the primary category and metric thresholds.
const coreMetricAssertionLevel = LIGHTHOUSE_ENFORCE_CORE_METRICS ? 'error' : 'warn';
const baseUrl = LIGHTHOUSE_BASE_URLS[LIGHTHOUSE_MODE];
const collect = {
	numberOfRuns: LIGHTHOUSE_NUMBER_OF_RUNS,
	url: LIGHTHOUSE_PAGE_PATHS.map((pagePath) => new URL(pagePath, baseUrl).toString()),
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
			includePassedAssertions: true,
			preset: 'lighthouse:recommended',
			assertions: {
				'categories:accessibility': [
					coreMetricAssertionLevel,
					{
						minScore: 0.9,
					},
				],
				'categories:best-practices': [
					coreMetricAssertionLevel,
					{
						minScore: 0.9,
					},
				],
				'categories:seo': [
					coreMetricAssertionLevel,
					{
						minScore: 0.9,
					},
				],
				// Keep performance warning-only until we decide to promote the threshold.
				'categories:performance': createMedianAssertion('warn', {
					minScore: 0.7,
				}),
				// These phase-1 warnings seed concrete metrics now so we can promote stable thresholds later.
				'largest-contentful-paint': createMedianAssertion(coreMetricAssertionLevel, {
					maxNumericValue: 2500,
				}),
				'image-delivery-insight': 'warn',
				'cumulative-layout-shift': createMedianAssertion(coreMetricAssertionLevel, {
					maxNumericValue: 0.1,
				}),
				'total-blocking-time': createMedianAssertion(coreMetricAssertionLevel, {
					maxNumericValue: 200,
				}),
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
