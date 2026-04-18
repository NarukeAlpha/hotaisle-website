import { ArrowUpRight, BookOpenText } from 'lucide-react';
import { AppLink } from '@/components/AppLink.tsx';
import { createPageMetadata } from '@/lib/metadata.ts';

const ADMIN_API_DOCS_URL = 'https://admin.hotaisle.app/api/docs/' as const;

const primaryResources = [
	{
		description: 'Browse endpoints, schemas, and example payloads in the docs.',
		href: ADMIN_API_DOCS_URL,
		isExternal: true,
		label: 'API reference',
	},
	{
		description: 'Get your account, SSH access, and first workload online quickly.',
		href: '/quick-start',
		isExternal: false,
		label: 'Quick start',
	},
	{
		description: 'Ask for access, support, or help wiring the API into your stack.',
		href: '/contact',
		isExternal: false,
		label: 'Contact support',
	},
] as const;

const gettingStartedSteps = [
	'Create or access your Hot Aisle account.',
	'Review the quick start flow for login, SSH, and environment setup.',
	'Use the API docs to inspect operations and request shapes.',
	'Reach out if you need account provisioning or integration support.',
] as const;

export function generateMetadata() {
	return createPageMetadata({
		description:
			'Documentation and discovery links for the Hot Aisle API, including access guidance and the live API reference.',
		image: '/assets/og/hot-aisle-share.png',
		imageAlt: 'Hot Aisle branded share image',
		path: '/docs/api',
		title: 'API Documentation',
	});
}

function ApiHeroArt() {
	return (
		<svg
			aria-hidden="true"
			className="h-auto w-full"
			fill="none"
			viewBox="0 0 640 480"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient id="api-docs-orbit" x1="108" x2="534" y1="78" y2="392">
					<stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
					<stop offset="0.5" stopColor="currentColor" stopOpacity="0.08" />
					<stop offset="1" stopColor="currentColor" stopOpacity="0.18" />
				</linearGradient>
				<linearGradient id="api-docs-panel" x1="220" x2="404" y1="122" y2="338">
					<stop offset="0" stopColor="white" stopOpacity="0.92" />
					<stop offset="1" stopColor="white" stopOpacity="0.62" />
				</linearGradient>
			</defs>

			<rect fill="url(#api-docs-orbit)" height="480" rx="32" width="640" />
			<circle cx="124" cy="110" fill="currentColor" fillOpacity="0.08" r="84" />
			<circle cx="544" cy="378" fill="currentColor" fillOpacity="0.1" r="74" />
			<circle cx="502" cy="94" fill="currentColor" fillOpacity="0.12" r="16" />
			<circle cx="152" cy="362" fill="currentColor" fillOpacity="0.12" r="12" />

			<path
				d="M131 333C155 268 202 233 273 228C345 223 395 187 430 111"
				stroke="currentColor"
				strokeLinecap="round"
				strokeOpacity="0.16"
				strokeWidth="18"
			/>
			<path
				d="M140 177C189 198 229 197 260 173C291 149 330 144 377 157C424 170 460 160 485 126"
				stroke="currentColor"
				strokeLinecap="round"
				strokeOpacity="0.24"
				strokeWidth="10"
			/>

			<rect
				fill="url(#api-docs-panel)"
				height="218"
				rx="28"
				stroke="currentColor"
				strokeOpacity="0.16"
				strokeWidth="2"
				width="212"
				x="212"
				y="126"
			/>
			<rect
				fill="currentColor"
				fillOpacity="0.12"
				height="18"
				rx="9"
				width="82"
				x="244"
				y="162"
			/>
			<rect
				fill="currentColor"
				fillOpacity="0.2"
				height="10"
				rx="5"
				width="144"
				x="244"
				y="200"
			/>
			<rect
				fill="currentColor"
				fillOpacity="0.14"
				height="10"
				rx="5"
				width="118"
				x="244"
				y="224"
			/>
			<rect
				fill="currentColor"
				fillOpacity="0.14"
				height="10"
				rx="5"
				width="132"
				x="244"
				y="248"
			/>

			<rect
				fill="currentColor"
				fillOpacity="0.85"
				height="42"
				rx="14"
				width="132"
				x="244"
				y="286"
			/>
			<path d="M278 307H344" stroke="white" strokeLinecap="round" strokeWidth="8" />

			<rect
				fill="currentColor"
				fillOpacity="0.18"
				height="126"
				rx="24"
				stroke="currentColor"
				strokeOpacity="0.16"
				strokeWidth="2"
				width="144"
				x="416"
				y="214"
			/>
			<path
				d="M452 255L481 239L514 255V294C514 316 500 336 481 345C462 336 448 316 448 294V255H452Z"
				fill="currentColor"
				fillOpacity="0.78"
			/>
			<path
				d="M470 291L479 300L495 279"
				stroke="white"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="8"
			/>

			<rect
				fill="currentColor"
				fillOpacity="0.18"
				height="92"
				rx="20"
				stroke="currentColor"
				strokeOpacity="0.16"
				strokeWidth="2"
				width="132"
				x="92"
				y="116"
			/>
			<path
				d="M126 162H190"
				stroke="currentColor"
				strokeLinecap="round"
				strokeOpacity="0.72"
				strokeWidth="10"
			/>
			<path
				d="M126 186H170"
				stroke="currentColor"
				strokeLinecap="round"
				strokeOpacity="0.4"
				strokeWidth="10"
			/>

			<path
				d="M198 343C214 343 227 330 227 314C227 298 214 285 198 285C182 285 169 298 169 314C169 330 182 343 198 343Z"
				fill="currentColor"
				fillOpacity="0.68"
			/>
			<path d="M198 301V327" stroke="white" strokeLinecap="round" strokeWidth="8" />
			<path d="M185 314H211" stroke="white" strokeLinecap="round" strokeWidth="8" />
		</svg>
	);
}

function ResourceCard({
	description,
	href,
	isExternal,
	label,
}: {
	description: string;
	href: string;
	isExternal: boolean;
	label: string;
}) {
	const className =
		'group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-hot-orange/40';

	if (isExternal) {
		return (
			<a className={className} href={href} rel="noopener" target="_blank">
				<div className="space-y-3">
					<p className="whitespace-nowrap font-semibold text-foreground text-lg">
						{label}
					</p>
					<p className="text-base text-muted-foreground leading-7">{description}</p>
				</div>
				<span className="mt-6 inline-flex items-center gap-2 font-semibold text-base text-hot-orange-contrast">
					Visit docs
					<ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
				</span>
			</a>
		);
	}

	return (
		<AppLink className={className} href={href}>
			<div className="space-y-3">
				<p className="whitespace-nowrap font-semibold text-foreground text-lg">{label}</p>
				<p className="text-base text-muted-foreground leading-7">{description}</p>
			</div>
			<span className="mt-6 inline-flex items-center gap-2 font-semibold text-base text-hot-orange-contrast">
				Open page
				<ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
			</span>
		</AppLink>
	);
}

export default function ApiDocsPage() {
	return (
		<main className="bg-background text-foreground">
			<section className="relative overflow-hidden border-border/70 border-b">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(154_51_8/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgb(14_165_233/0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgb(154_51_8/0.3),transparent_30%),radial-gradient(circle_at_78%_18%,rgb(245_158_11/0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgb(14_165_233/0.22),transparent_24%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(rgb(15_23_42/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(15_23_42/0.03)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgb(255_255_255/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.08)_1px,transparent_1px)]" />
				<div className="absolute inset-0 hidden dark:block dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.03),transparent_28%,transparent_72%,rgb(14_165_233/0.05))]" />

				<div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center lg:py-20">
					<div className="order-2 max-w-2xl space-y-8 lg:order-1">
						<div className="space-y-5">
							<p className="font-semibold text-hot-orange text-sm uppercase tracking-[0.24em]">
								Service Documentation
							</p>
							<h1 className="font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl">
								Hot Aisle API access and reference docs
							</h1>
							<p className="max-w-xl text-lg text-muted-foreground leading-8">
								Manage compute resources through the API, use the live reference and
								quick start flow to move from account access to actual requests.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<a
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-hot-orange px-5 py-3 font-semibold text-white shadow-hot-orange/15 shadow-lg transition hover:-translate-y-0.5 hover:opacity-95"
								href={ADMIN_API_DOCS_URL}
								rel="noopener"
								target="_blank"
							>
								Open docs
								<ArrowUpRight className="h-4 w-4" />
							</a>
							<AppLink
								className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-3 font-semibold text-foreground transition hover:border-hot-orange/30 hover:bg-muted/70"
								href="/quick-start"
							>
								Read quick start
							</AppLink>
						</div>
					</div>

					<div className="order-1 mx-auto w-full max-w-xl lg:order-2">
						<div className="rounded-4xl border border-border/80 bg-card/70 p-4 shadow-2xl shadow-black/5 backdrop-blur-sm dark:shadow-black/30">
							<div className="rounded-3xl bg-[linear-gradient(135deg,rgb(255_255_255/0.85),rgb(248_250_252/0.38))] p-4 text-hot-orange dark:bg-[linear-gradient(135deg,rgb(255_255_255/0.08),rgb(255_255_255/0.03))]">
								<ApiHeroArt />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-4 md:pt-10 md:pb-6 lg:pb-2">
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
					<section
						aria-labelledby="api-resources-heading"
						className="rounded-3xl border border-border bg-muted/35 p-6 md:p-8"
					>
						<div className="mb-6 flex items-center gap-3">
							<div className="rounded-xl bg-hot-orange/10 p-3 text-hot-orange">
								<BookOpenText className="h-5 w-5" />
							</div>
							<div>
								<h2
									className="font-bold text-2xl tracking-tight"
									id="api-resources-heading"
								>
									Primary resources
								</h2>
								<p className="text-base text-muted-foreground">
									Use the docs, the setup guide, and the support path together.
								</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{primaryResources.map((resource) => (
								<ResourceCard key={resource.label} {...resource} />
							))}
						</div>
					</section>

					<aside className="rounded-3xl border border-border bg-background p-6 md:p-8">
						<h2 className="font-bold text-2xl tracking-tight">How to get started</h2>
						<ol className="mt-6 space-y-4">
							{gettingStartedSteps.map((step, index) => (
								<li className="grid grid-cols-[auto_1fr] gap-x-4" key={step}>
									<span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hot-orange font-semibold text-sm text-white">
										{index + 1}
									</span>
									<p className="text-base text-muted-foreground leading-7">
										{step}
									</p>
								</li>
							))}
						</ol>
					</aside>
				</div>
			</section>
		</main>
	);
}
