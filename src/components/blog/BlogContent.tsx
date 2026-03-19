'use client';

import { useEffect, useEffectEvent, useId, useRef } from 'react';
import { BlogAuthorCard } from '@/components/blog/BlogAuthorCard.tsx';
import { BlogContentImageModal } from '@/components/blog/BlogContentImageModal.tsx';
import type { BlogAuthorProfile } from '@/generated/blog-data.ts';

const MERMAID_CODE_SELECTOR = 'pre code.language-mermaid';
const MERMAID_DIAGRAM_CLASS = 'mermaid-diagram';
const DARK_MODE_CLASS = 'dark';
const ROOT_ID_SANITIZER_REGEX = /[^a-z0-9-]+/gi;
const NOOP_CLEANUP = () => {
	// Intentionally empty cleanup.
};

function createMermaidRenderId(rootId: string, index: number): string {
	const sanitizedRootId = rootId.replace(ROOT_ID_SANITIZER_REGEX, '-').toLowerCase();
	return `mermaid-${sanitizedRootId}-${index}`;
}

interface BlogContentProps {
	authorProfile?: BlogAuthorProfile;
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

export function BlogContent({ authorProfile, contentHtml, haFooter = false }: BlogContentProps) {
	const rootId = useId();
	const rootRef = useRef<HTMLDivElement | null>(null);

	const renderMermaidDiagrams = useEffectEvent(async () => {
		const contentElement = rootRef.current;
		const ownerDocument = contentElement?.ownerDocument;
		if (!(contentElement && ownerDocument)) {
			return NOOP_CLEANUP;
		}

		const mermaidCodeBlocks = Array.from(
			contentElement.querySelectorAll<HTMLElement>(MERMAID_CODE_SELECTOR)
		);
		if (mermaidCodeBlocks.length === 0) {
			return NOOP_CLEANUP;
		}

		const mermaidModule = await import('mermaid');
		const mermaid = mermaidModule.default;
		const mermaidTheme = ownerDocument.documentElement.classList.contains(DARK_MODE_CLASS)
			? 'dark'
			: 'default';

		mermaid.initialize({
			startOnLoad: false,
			securityLevel: 'strict',
			theme: mermaidTheme,
		});

		const insertedDiagrams: HTMLDivElement[] = [];
		const hiddenPreElements: HTMLPreElement[] = [];

		for (const [index, codeElement] of mermaidCodeBlocks.entries()) {
			const preElement = codeElement.parentElement;
			const diagramDefinition = codeElement.textContent?.trim();
			if (!(preElement instanceof HTMLPreElement && diagramDefinition)) {
				continue;
			}

			const diagramElement = ownerDocument.createElement('div');
			diagramElement.className = MERMAID_DIAGRAM_CLASS;

			try {
				const renderId = createMermaidRenderId(rootId, index);
				const { bindFunctions, svg } = await mermaid.render(renderId, diagramDefinition);
				diagramElement.innerHTML = svg;
				bindFunctions?.(diagramElement);
				preElement.hidden = true;
				preElement.after(diagramElement);
				insertedDiagrams.push(diagramElement);
				hiddenPreElements.push(preElement);
			} catch (error) {
				console.error('Failed to render Mermaid diagram.', error);
			}
		}

		return () => {
			for (const preElement of hiddenPreElements) {
				preElement.hidden = false;
			}
			for (const diagramElement of insertedDiagrams) {
				diagramElement.remove();
			}
		};
	});

	useEffect(() => {
		const contentElement = rootRef.current;
		const ownerDocument = contentElement?.ownerDocument;
		const documentElement = ownerDocument?.documentElement;
		if (!(contentElement && ownerDocument && documentElement)) {
			return;
		}

		let cleanupRender = NOOP_CLEANUP;

		const render = async () => {
			cleanupRender();
			cleanupRender = await renderMermaidDiagrams();
		};

		render().catch((error: unknown) => {
			console.error('Failed to initialize Mermaid diagrams.', error);
		});

		const observer = new MutationObserver(() => {
			render().catch((error: unknown) => {
				console.error('Failed to update Mermaid diagrams.', error);
			});
		});

		observer.observe(documentElement, {
			attributeFilter: ['class'],
			attributes: true,
		});

		return () => {
			observer.disconnect();
			cleanupRender();
		};
	}, []);

	return (
		<>
			<div id={rootId} ref={rootRef}>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: trusted repository content */}
				<div dangerouslySetInnerHTML={{ __html: contentHtml }} />
				{authorProfile ? <BlogAuthorCard profile={authorProfile} /> : null}
				{haFooter ? <HotAisleFooter /> : null}
			</div>
			<BlogContentImageModal rootId={rootId} />
		</>
	);
}
