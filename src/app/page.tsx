import { AppLink } from '@/components/AppLink.tsx';
import HotAisleHero from '@/components/home/HotAisleHero.tsx';
import { SecuritySection } from '@/components/home/SecuritySection.tsx';
import { VideoSection } from '@/components/home/VideoSection.tsx';
import { createPageMetadata } from '@/lib/metadata.ts';

export function generateMetadata() {
	return createPageMetadata({
		description:
			'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.',
		path: '/',
		title: 'Hot Aisle - AMD Exclusive AI Cloud',
	});
}

export default function Home() {
	return (
		<div className="animation-fade-in min-h-screen overflow-x-hidden bg-background pb-20 text-foreground">
			<HotAisleHero />

			<SecuritySection />

			<VideoSection />

			{/* Footer CTA */}
			<section className="bg-hot-orange py-24 text-center text-white">
				<h2 className="mb-8 font-bold text-4xl">Ready to Accelerate?</h2>
				<AppLink
					className="inline-flex rounded-full bg-white px-8 py-4 font-bold text-hot-orange text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:bg-neutral-100"
					href="/quick-start"
				>
					Launch Instance
				</AppLink>
			</section>
		</div>
	);
}
