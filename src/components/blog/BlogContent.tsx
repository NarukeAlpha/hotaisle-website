import { useId } from 'react';
import { BlogContentImageModal } from '@/components/blog/BlogContentImageModal.tsx';

interface BlogContentProps {
	contentHtml: string;
}

export function BlogContent({ contentHtml }: BlogContentProps) {
	const rootId = useId();

	return (
		<>
			<div id={rootId}>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: trusted repository content */}
				<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
			</div>
			<BlogContentImageModal rootId={rootId} />
		</>
	);
}
