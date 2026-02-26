'use client';

import { ChevronLeft, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getPageContent, type PageData } from '@/lib/content';

export default function PolicyPage() {
	const { slug } = useParams<{ slug: string }>();
	const [page, setPage] = useState<PageData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		async function loadPage() {
			if (!slug) {
				setLoading(false);
				return;
			}
			const content = await getPageContent('policies', slug);
			if (mounted) {
				setPage(content);
				setLoading(false);
			}
		}
		loadPage().catch(() => {
			if (mounted) {
				setLoading(false);
			}
		});
		return () => {
			mounted = false;
		};
	}, [slug]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!page) {
		return <Navigate replace to="/404" />;
	}

	return (
		<div className="container mx-auto min-h-screen max-w-5xl px-6 py-12">
			{/* Breadcrumb / Back */}
			{/* Breadcrumb / Back */}
			<div className="sticky top-0 z-50 -mx-6 mb-8 border-transparent border-b bg-background/80 px-6 py-4 backdrop-blur-md transition-all data-[stuck=true]:border-border">
				<Link
					className="inline-flex items-center font-medium text-muted-foreground text-sm transition-colors hover:text-arctic-blue"
					to="/policies"
				>
					<ChevronLeft className="mr-1" size={16} />
					Back to Policies
				</Link>
			</div>

			{/* Header */}
			<div className="mb-4 pb-0">
				<div className="mb-4 flex items-center gap-3">
					<div className="rounded-lg bg-arctic-blue/10 p-2">
						<FileText className="text-arctic-blue" size={24} />
					</div>
					<span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
						Legal Document
					</span>
				</div>
				<h1 className="font-black text-4xl text-foreground tracking-tighter md:text-5xl">
					{page.title}
				</h1>
				{page.description && (
					<p className="mt-4 font-light text-muted-foreground text-xl">
						{page.description}
					</p>
				)}
			</div>

			{/* Content */}
			<article className="prose prose-lg dark:prose-invert max-w-none prose-code:rounded prose-blockquote:rounded-r-lg prose-blockquote:border-arctic-blue prose-blockquote:bg-muted/50 prose-code:bg-muted prose-blockquote:px-4 prose-code:px-1 prose-blockquote:py-2 prose-headings:font-bold prose-a:text-arctic-blue prose-blockquote:text-muted-foreground prose-code:text-arctic-blue prose-headings:text-foreground prose-li:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-td:text-foreground prose-th:text-foreground prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline">
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: danger lover */}
				<div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
			</article>
		</div>
	);
}
