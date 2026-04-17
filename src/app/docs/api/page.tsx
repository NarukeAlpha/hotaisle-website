import { AppLink } from '@/components/AppLink.tsx';
import { createPageMetadata } from '@/lib/metadata.ts';

const ADMIN_API_DOCS_URL = 'https://admin.hotaisle.app/api/docs/' as const;

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

export default function ApiDocsPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-16 text-foreground">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
				<header className="space-y-4">
					<p className="font-semibold text-hot-orange text-sm uppercase tracking-[0.24em]">
						Service Documentation
					</p>
					<h1 className="font-black text-4xl tracking-tight sm:text-5xl">
						Hot Aisle API access and reference
					</h1>
					<p className="max-w-3xl text-lg text-muted-foreground">
						Hot Aisle exposes an API for managing compute resources. Use the live API
						reference for request and response details, and use the quick start guide
						for account setup and first-use workflow.
					</p>
				</header>

				<section
					aria-labelledby="api-resources-heading"
					className="grid gap-6 md:grid-cols-2"
				>
					<article className="rounded-2xl border border-border bg-muted/40 p-6">
						<h2 className="font-bold text-2xl" id="api-resources-heading">
							Primary resources
						</h2>
						<div className="mt-5 space-y-4 text-muted-foreground">
							<p>
								<a
									className="font-semibold text-foreground underline underline-offset-4"
									href={ADMIN_API_DOCS_URL}
									rel="noopener"
									target="_blank"
								>
									Open the live API documentation
								</a>
							</p>
							<p>
								<AppLink
									className="font-semibold text-foreground underline underline-offset-4"
									href="/quick-start"
								>
									Read the quick start guide
								</AppLink>
							</p>
							<p>
								<AppLink
									className="font-semibold text-foreground underline underline-offset-4"
									href="/contact"
								>
									Contact Hot Aisle for access or support
								</AppLink>
							</p>
						</div>
					</article>

					<article className="rounded-2xl border border-border bg-background p-6">
						<h2 className="font-bold text-2xl">How to get started</h2>
						<ol className="mt-5 list-decimal space-y-3 pl-5 text-muted-foreground">
							<li>Create or access your Hot Aisle account.</li>
							<li>Review the quick start guide for SSH and environment setup.</li>
							<li>Use the live API reference to explore available operations.</li>
							<li>
								Reach out through the contact page if you need account or API help.
							</li>
						</ol>
					</article>
				</section>
			</div>
		</main>
	);
}
