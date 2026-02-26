import { Link } from 'react-router-dom';
import { PyramidHero } from '@/components/home/PyramidHero';
import { SecuritySection } from '@/components/home/SecuritySection';
import { VideoSection } from '@/components/home/VideoSection';

export default function Home() {
	return (
		<div className="animation-fade-in min-h-screen overflow-x-hidden bg-background pb-20 text-foreground">
			<PyramidHero />

			<SecuritySection />

			<VideoSection />

			{/* Footer CTA */}
			<section className="bg-hot-orange py-24 text-center text-white">
				<h2 className="mb-8 font-bold text-4xl">Ready to Accelerate?</h2>
				<Link
					className="inline-flex rounded-full bg-white px-8 py-4 font-bold text-hot-orange text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:bg-neutral-100"
					to="/quick-start"
				>
					Launch Instance
				</Link>
			</section>
		</div>
	);
}
