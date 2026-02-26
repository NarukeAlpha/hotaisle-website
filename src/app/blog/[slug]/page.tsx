'use client';

import { ArrowLeft, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getPageContent, type PageData } from '@/lib/content';

const PUBLISH_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC',
});

export default function BlogPostPage() {
	const { slug } = useParams<{ slug: string }>();
	const [post, setPost] = useState<PageData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadPost() {
			if (!slug) {
				setLoading(false);
				return;
			}
			const content = await getPageContent('blog', slug);
			setPost(content);
			setLoading(false);
		}
		loadPost();
	}, [slug]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!post) {
		return <Navigate replace to="/404" />;
	}

	return (
		<div className="animation-fade-in min-h-screen bg-background pb-20 text-foreground">
			<div className="relative h-[50vh] min-h-100 w-full overflow-hidden border-border border-b bg-background">
				{post.coverImage && (
					<div className="absolute inset-0">
						<img
							alt={post.title}
							className="h-full w-full object-cover"
							height={720}
							src={post.coverImage}
							width={1280}
						/>
						<div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/30" />
					</div>
				)}
				<div className="container absolute inset-0 z-10 mx-auto flex max-w-4xl flex-col justify-end px-6 pb-12">
					<Link
						className="group mb-8 inline-flex items-center font-bold text-muted-foreground text-sm uppercase tracking-wide transition-colors hover:text-foreground"
						to="/blog"
					>
						<ArrowLeft
							className="mr-2 transition-transform group-hover:-translate-x-1"
							size={16}
						/>
						Back to Blog
					</Link>

					<div className="mb-6 flex flex-wrap gap-2">
						{post.tags?.map((tag: string) => (
							<span
								className="rounded-full border border-arctic-blue/20 bg-arctic-blue/10 px-3 py-1 font-bold text-arctic-blue text-xs uppercase tracking-wider backdrop-blur-sm"
								key={tag}
							>
								{tag}
							</span>
						))}
					</div>

					<h1 className="mb-6 font-black text-4xl text-foreground leading-tight tracking-tighter drop-shadow-2xl md:text-6xl">
						{post.title}
					</h1>

					<div className="flex flex-wrap items-center gap-6 font-medium text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="text-arctic-blue" size={18} />
							<time dateTime={post.date}>
								{PUBLISH_DATE_FORMATTER.format(new Date(post.date ?? ''))}
							</time>
						</div>
						{post.author && <p>By {post.author}</p>}
					</div>
				</div>
			</div>

			<article className="container relative z-20 mx-auto -mt-10 max-w-6xl px-6">
				<div className="rounded-2xl border border-border bg-card p-8 shadow-xl md:p-12">
					<div className="prose prose-lg max-w-none prose-img:rounded-lg prose-a:text-arctic-blue prose-blockquote:text-muted-foreground prose-code:text-arctic-blue prose-headings:text-foreground prose-strong:text-foreground text-foreground leading-relaxed prose-img:shadow-md">
						{/** biome-ignore lint/security/noDangerouslySetInnerHtml: trusted repository content */}
						<div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
					</div>
				</div>

				<div className="mt-16 border-border border-t pt-16 text-center">
					<h3 className="mb-6 font-bold text-2xl">More from Hot Aisle</h3>
					<Link
						className="inline-flex rounded-full border border-border bg-muted px-8 py-3 font-bold text-foreground transition-all hover:border-arctic-blue/30 hover:bg-muted/80"
						to="/blog"
					>
						Read More Articles
					</Link>
				</div>
			</article>
		</div>
	);
}
