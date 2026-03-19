import { useId } from 'react';
import { BlogContentImageModal } from '@/components/blog/BlogContentImageModal.tsx';

interface BlogContentProps {
	contentHtml: string;
	haFooter?: boolean;
}

function HotAisleFooter() {
	return (
		<section
			aria-labelledby="contribute-to-hot-aisle"
			className="mt-12 border-border border-t pt-8"
		>
			<h2 className="mb-4 font-bold text-2xl" id="contribute-to-hot-aisle">
				Contribute to Hot Aisle
			</h2>
			<p className="mb-4">
				The Hot Aisle website is open source under the MIT License and welcomes
				contributions from the community. Whether you want to fix a typo, improve
				documentation, or share your own technical content, we'd love to have your input.
			</p>
			<p>
				<strong>Visit our GitHub repository:</strong>{' '}
				<a
					href="https://github.com/hotaisle/hotaisle-website"
					rel="noopener"
					target="_blank"
				>
					github.com/hotaisle/hotaisle-website
				</a>
			</p>
		</section>
	);
}

export function BlogContent({ contentHtml, haFooter = false }: BlogContentProps) {
	const rootId = useId();

	return (
		<>
			<div id={rootId}>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: trusted repository content */}
				<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
				{haFooter ? <HotAisleFooter /> : null}
			</div>
			<BlogContentImageModal rootId={rootId} />
		</>
	);
}
