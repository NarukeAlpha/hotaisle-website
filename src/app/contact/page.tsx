import { createPageMetadata } from '@/lib/metadata';

export function generateMetadata() {
	return createPageMetadata({
		description:
			'Contact Hot Aisle for infrastructure, partnerships, reservations, or support.',
		path: '/contact',
		title: 'Contact Hot Aisle',
	});
}

export default function ContactPage() {
	return (
		<div className="animation-fade-in min-h-screen bg-background px-6 py-16 text-foreground">
			<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
				<div className="w-full overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
					<video
						autoPlay
						className="h-full w-full object-cover"
						controls
						loop
						muted
						playsInline
					>
						<source src="/assets/contact/contact.mp4" type="video/mp4" />
					</video>
				</div>

				<div className="space-y-3">
					<h1 className="font-black text-4xl tracking-tight">Contact Us</h1>
					<p className="text-lg text-muted-foreground">
						Email us at{' '}
						<a
							className="font-semibold text-hot-orange underline underline-offset-4"
							href="mailto:hello@hotaisle.ai"
						>
							hello@hotaisle.ai
						</a>
						.
					</p>
					<p className="text-muted-foreground">
						A human from our team will return your message soon.
					</p>
				</div>
			</div>
		</div>
	);
}
