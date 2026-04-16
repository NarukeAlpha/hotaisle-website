import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const DEFAULT_REPORT_DIRECTORY = path.join(PROJECT_ROOT, '.lighthouseci', 'reports');
const MANIFEST_FILE_NAME = 'manifest.json';
const INDEX_FILE_NAME = 'index.html';
const NO_JEKYLL_FILE_NAME = '.nojekyll';
const PATH_SEPARATOR_REGEX = /\\/g;
const CATEGORY_IDS = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
const CATEGORY_LABELS = {
	performance: 'Performance',
	accessibility: 'Accessibility',
	'best-practices': 'Best Practices',
	seo: 'SEO',
} as const;

type CategoryId = (typeof CATEGORY_IDS)[number];

interface LighthouseSummary {
	accessibility?: number;
	'best-practices'?: number;
	performance?: number;
	seo?: number;
}

interface LighthouseManifestEntry {
	htmlPath: string;
	isRepresentativeRun: boolean;
	jsonPath: string;
	summary: LighthouseSummary;
	url: string;
}

function normalizePath(filePath: string): string {
	return filePath.replace(PATH_SEPARATOR_REGEX, '/');
}

function resolveReportDirectory(): string {
	const reportDirectory = process.env.LIGHTHOUSE_REPORT_DIR;

	if (!reportDirectory) {
		return DEFAULT_REPORT_DIRECTORY;
	}

	return path.isAbsolute(reportDirectory)
		? reportDirectory
		: path.join(PROJECT_ROOT, reportDirectory);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object';
}

function isLighthouseSummary(value: unknown): value is LighthouseSummary {
	if (!isRecord(value)) {
		return false;
	}

	for (const categoryId of CATEGORY_IDS) {
		const categoryValue = value[categoryId];

		if (categoryValue !== undefined && typeof categoryValue !== 'number') {
			return false;
		}
	}

	return true;
}

function isManifestEntry(value: unknown): value is LighthouseManifestEntry {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.url === 'string' &&
		typeof value.isRepresentativeRun === 'boolean' &&
		typeof value.htmlPath === 'string' &&
		typeof value.jsonPath === 'string' &&
		isLighthouseSummary(value.summary)
	);
}

async function loadManifest(reportDirectory: string): Promise<LighthouseManifestEntry[]> {
	const manifestPath = path.join(reportDirectory, MANIFEST_FILE_NAME);
	const manifestContents = await readFile(manifestPath, 'utf8');
	const parsedManifest = JSON.parse(manifestContents) as unknown;

	if (!Array.isArray(parsedManifest)) {
		throw new Error(`Unexpected Lighthouse manifest format in ${manifestPath}`);
	}

	if (!parsedManifest.every(isManifestEntry)) {
		throw new Error(`Unexpected Lighthouse manifest format in ${manifestPath}`);
	}

	return parsedManifest;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function getPathLabel(urlString: string): string {
	const { pathname } = new URL(urlString);
	return pathname || '/';
}

function toRelativePath(reportDirectory: string, filePath: string): string {
	return normalizePath(path.relative(reportDirectory, filePath));
}

function getScoreValue(summary: LighthouseSummary, categoryId: CategoryId): number | null {
	const score = summary[categoryId];
	return typeof score === 'number' ? score : null;
}

function getScoreDisplay(score: number | null): string {
	if (score === null) {
		return 'n/a';
	}

	return String(Math.round(score * 100));
}

function getScoreClass(score: number | null): string {
	if (score === null) {
		return 'score-muted';
	}

	const normalizedScore = Math.round(score * 100);

	if (normalizedScore >= 90) {
		return 'score-good';
	}

	if (normalizedScore >= 50) {
		return 'score-ok';
	}

	return 'score-poor';
}

function sortManifestEntries(entries: LighthouseManifestEntry[]): LighthouseManifestEntry[] {
	return [...entries].sort((left, right) => {
		const pathComparison = getPathLabel(left.url).localeCompare(getPathLabel(right.url));

		if (pathComparison !== 0) {
			return pathComparison;
		}

		if (left.isRepresentativeRun !== right.isRepresentativeRun) {
			return left.isRepresentativeRun ? -1 : 1;
		}

		return left.htmlPath.localeCompare(right.htmlPath);
	});
}

function getRepresentativeEntries(entries: LighthouseManifestEntry[]): LighthouseManifestEntry[] {
	const representativeEntries = new Map<string, LighthouseManifestEntry>();

	for (const entry of sortManifestEntries(entries)) {
		const existingEntry = representativeEntries.get(entry.url);

		if (!existingEntry || entry.isRepresentativeRun) {
			representativeEntries.set(entry.url, entry);
		}
	}

	return sortManifestEntries([...representativeEntries.values()]);
}

function getAverageSummary(entries: LighthouseManifestEntry[]): LighthouseSummary {
	const averageSummary: LighthouseSummary = {};

	for (const categoryId of CATEGORY_IDS) {
		let total = 0;
		let count = 0;

		for (const entry of entries) {
			const score = getScoreValue(entry.summary, categoryId);

			if (score === null) {
				continue;
			}

			total += score;
			count += 1;
		}

		if (count > 0) {
			averageSummary[categoryId] = total / count;
		}
	}

	return averageSummary;
}

function renderScoreCard(
	label: string,
	score: number | null,
	reportHref: string,
	className: string
): string {
	const scoreDisplay = getScoreDisplay(score);
	const scoreClass = getScoreClass(score);
	const scoreValue = score === null ? 0 : Math.round(score * 100);

	return `
		<a class="score-card ${className} ${scoreClass}" href="${escapeHtml(reportHref)}">
			<span class="score-ring" style="--score:${scoreValue};">
				<span class="score-value">${escapeHtml(scoreDisplay)}</span>
			</span>
			<span class="score-label">${escapeHtml(label)}</span>
		</a>
	`;
}

function renderOverviewCards(summary: LighthouseSummary, reportHref: string): string {
	return CATEGORY_IDS.map((categoryId) =>
		renderScoreCard(
			CATEGORY_LABELS[categoryId],
			getScoreValue(summary, categoryId),
			reportHref,
			'score-card-overview'
		)
	).join('');
}

function renderRepresentativeSections(
	reportDirectory: string,
	representativeEntries: LighthouseManifestEntry[]
): string {
	return representativeEntries
		.map((entry) => {
			const htmlHref = toRelativePath(reportDirectory, entry.htmlPath);
			const jsonHref = toRelativePath(reportDirectory, entry.jsonPath);
			const pathLabel = getPathLabel(entry.url);
			const scoreCards = CATEGORY_IDS.map((categoryId) =>
				renderScoreCard(
					CATEGORY_LABELS[categoryId],
					getScoreValue(entry.summary, categoryId),
					htmlHref,
					'score-card-page'
				)
			).join('');

			return `
				<article class="page-card">
					<header class="page-card-header">
						<div>
							<p class="page-eyebrow">Representative run</p>
							<h2>${escapeHtml(pathLabel)}</h2>
							<p class="page-url">${escapeHtml(entry.url)}</p>
						</div>
						<nav class="page-links" aria-label="Report links for ${escapeHtml(pathLabel)}">
							<a href="${escapeHtml(htmlHref)}">HTML report</a>
							<a href="${escapeHtml(jsonHref)}">JSON</a>
						</nav>
					</header>
					<div class="score-grid">${scoreCards}</div>
				</article>
			`;
		})
		.join('');
}

function renderAllReportsTable(
	reportDirectory: string,
	manifestEntries: LighthouseManifestEntry[]
): string {
	return sortManifestEntries(manifestEntries)
		.map((entry) => {
			const htmlHref = toRelativePath(reportDirectory, entry.htmlPath);
			const jsonHref = toRelativePath(reportDirectory, entry.jsonPath);
			const pathLabel = getPathLabel(entry.url);
			const scoreCells = CATEGORY_IDS.map((categoryId) => {
				const score = getScoreValue(entry.summary, categoryId);
				return `<td class="score-cell ${getScoreClass(score)}">${escapeHtml(getScoreDisplay(score))}</td>`;
			}).join('');

			return `
				<tr>
					<td>${escapeHtml(pathLabel)}</td>
					<td>${entry.isRepresentativeRun ? 'Representative' : 'Supporting'}</td>
					${scoreCells}
					<td><a href="${escapeHtml(htmlHref)}">HTML</a></td>
					<td><a href="${escapeHtml(jsonHref)}">JSON</a></td>
				</tr>
			`;
		})
		.join('');
}

const STYLES = `
	:root {
		color-scheme: dark;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		background: #08111f;
		color: #e2e8f0;
	}

	* {
		box-sizing: border-box;
	}

	body {
		margin: 0;
		background:
			radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 28%),
			radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.16), transparent 24%),
			linear-gradient(180deg, #0a1120 0%, #020617 100%);
	}

	a {
		color: #7dd3fc;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, monospace;
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1.5rem 4rem;
	}

	section {
		margin-top: 2rem;
	}

	.hero,
	.panel,
	.page-card {
		background: rgba(9, 15, 28, 0.84);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(71, 85, 105, 0.5);
		border-radius: 1.5rem;
		box-shadow: 0 20px 45px rgba(2, 6, 23, 0.5);
	}

	.hero {
		padding: 2rem;
	}

	.hero h1,
	.section-header h2,
	.page-card h2 {
		margin: 0;
	}

	.hero p,
	.page-url,
	.section-header p {
		color: #94a3b8;
		line-height: 1.6;
	}

	.hero-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1rem;
	}

	.hero-meta span {
		padding: 0.5rem 0.75rem;
		border-radius: 999px;
		background: rgba(30, 41, 59, 0.92);
		border: 1px solid rgba(71, 85, 105, 0.65);
		color: #cbd5e1;
		font-size: 0.95rem;
	}

	.panel {
		padding: 1.5rem;
	}

	.section-header {
		margin-bottom: 1rem;
	}

	.score-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	}

	.score-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1.25rem;
		background: rgba(15, 23, 42, 0.94);
		border: 1px solid rgba(71, 85, 105, 0.65);
		color: inherit;
	}

	.score-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 24px rgba(2, 6, 23, 0.45);
		text-decoration: none;
	}

	.score-card-overview {
		padding-top: 1.25rem;
		padding-bottom: 1.25rem;
	}

	.score-ring {
		position: relative;
		display: grid;
		place-items: center;
		width: 5.75rem;
		height: 5.75rem;
		border-radius: 999px;
		background: conic-gradient(var(--ring-color) calc(var(--score) * 1%), #334155 0);
	}

	.score-ring::before {
		content: '';
		position: absolute;
		inset: 0.55rem;
		border-radius: inherit;
		background: #020817;
	}

	.score-value {
		position: relative;
		z-index: 1;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--score-text);
	}

	.score-label {
		font-weight: 600;
	}

	.score-good {
		--ring-color: #0cce6b;
		--score-text: #087f39;
	}

	.score-ok {
		--ring-color: #ffa400;
		--score-text: #9c5700;
	}

	.score-poor {
		--ring-color: #ff4e42;
		--score-text: #b42318;
	}

	.score-muted {
		--ring-color: #94a3b8;
		--score-text: #cbd5e1;
	}

	.page-list {
		display: grid;
		gap: 1rem;
	}

	.page-card {
		padding: 1.5rem;
	}

	.page-card-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.page-eyebrow {
		margin: 0 0 0.25rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #38bdf8;
	}

	.page-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.page-links a {
		padding: 0.55rem 0.85rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.96);
		border: 1px solid rgba(96, 165, 250, 0.35);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.85rem 0.75rem;
		border-bottom: 1px solid rgba(51, 65, 85, 0.9);
		text-align: left;
	}

	th {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #94a3b8;
	}

	.score-cell {
		font-weight: 700;
	}

	.table-wrap {
		overflow-x: auto;
	}

	@media (max-width: 720px) {
		main {
			padding: 2rem 1rem 3rem;
		}

		.hero,
		.panel,
		.page-card {
			border-radius: 1.25rem;
		}

		.page-card-header {
			flex-direction: column;
		}
	}
`;

function renderPage(reportDirectory: string, manifestEntries: LighthouseManifestEntry[]): string {
	const representativeEntries = getRepresentativeEntries(manifestEntries);
	const averageSummary = getAverageSummary(representativeEntries);
	const overviewReportHref = representativeEntries[0]
		? toRelativePath(reportDirectory, representativeEntries[0].htmlPath)
		: '#';
	const generatedAt = new Date().toISOString();

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Hot Aisle Lighthouse Reports</title>
		<style>${STYLES}</style>
	</head>
	<body>
		<main>
			<section class="hero">
				<h1>Hot Aisle Lighthouse Reports</h1>
				<p>Latest localhost-based Lighthouse run published from <code>ci.yml</code>. The top summary mirrors Lighthouse's score-first layout, then each audited page links to its full interactive HTML report.</p>
				<div class="hero-meta">
					<span>${representativeEntries.length} representative pages</span>
					<span>${manifestEntries.length} total reports</span>
					<span>Generated ${escapeHtml(generatedAt)}</span>
				</div>
			</section>

			<section class="panel">
				<div class="section-header">
					<h2>Top Scores</h2>
					<p>These are the average category scores across the representative localhost runs. The GitHub Actions assertion log includes passed checks too, so the run prints the full assertion set instead of only warnings.</p>
				</div>
				<div class="score-grid">${renderOverviewCards(averageSummary, overviewReportHref)}</div>
			</section>

			<section>
				<div class="section-header">
					<h2>Representative Runs</h2>
					<p>Each card links straight to the interactive Lighthouse HTML report for that page.</p>
				</div>
				<div class="page-list">${renderRepresentativeSections(reportDirectory, representativeEntries)}</div>
			</section>

			<section class="panel">
				<div class="section-header">
					<h2>All Generated Reports</h2>
					<p>The latest production run overwrites this site, so it always reflects the newest published result set.</p>
				</div>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th scope="col">Page</th>
								<th scope="col">Run Type</th>
								<th scope="col">Performance</th>
								<th scope="col">Accessibility</th>
								<th scope="col">Best Practices</th>
								<th scope="col">SEO</th>
								<th scope="col">HTML</th>
								<th scope="col">JSON</th>
							</tr>
						</thead>
						<tbody>
							${renderAllReportsTable(reportDirectory, manifestEntries)}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	</body>
</html>
`;
}

async function main(): Promise<void> {
	const reportDirectory = resolveReportDirectory();
	const manifestEntries = await loadManifest(reportDirectory);
	const indexPath = path.join(reportDirectory, INDEX_FILE_NAME);
	const noJekyllPath = path.join(reportDirectory, NO_JEKYLL_FILE_NAME);

	await writeFile(indexPath, renderPage(reportDirectory, manifestEntries), 'utf8');
	await writeFile(noJekyllPath, '', 'utf8');

	console.log(
		`Wrote Lighthouse Pages index to ${normalizePath(path.relative(PROJECT_ROOT, indexPath))}`
	);
}

await main();
