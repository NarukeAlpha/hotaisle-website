'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@/lib/content';
import { cn } from '@/lib/utils';

export function BlogHero({ posts }: { posts: BlogPost[] }) {
	const [current, setCurrent] = useState(0);

	// Auto-advance
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrent((prev) => (prev + 1) % posts.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [posts.length]);

	if (!posts.length) {
		return null;
	}

	const next = () => setCurrent((current + 1) % posts.length);
	const prev = () => setCurrent((current - 1 + posts.length) % posts.length);

	return (
		<div className="group relative mb-12 h-125 w-full overflow-hidden rounded-xl">
			{posts.map((post, index) => (
				<div
					className={cn(
						'absolute inset-0 transition-opacity duration-700 ease-in-out',
						index === current ? 'z-10 opacity-100' : 'z-0 opacity-0'
					)}
					key={post.slug}
				>
					{/* Background Image/Overlay */}
					<div className="absolute inset-0 bg-neutral-900">
						{post.coverImage && (
							<img
								alt={post.title}
								className="h-full w-full object-cover opacity-60 transition-transform duration-2000 group-hover:scale-105"
								height={300}
								src={post.coverImage}
								width={200}
							/>
						)}
						<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
					</div>

					{/* Content */}
					<div className="absolute bottom-0 left-0 w-full p-8 md:w-2/3 md:p-12">
						<div className="mb-4 flex gap-2">
							{post.tags?.slice(0, 2).map((tag: string) => (
								<span
									className="rounded bg-arctic-blue/20 px-2 py-1 font-bold text-arctic-blue text-xs uppercase tracking-wider"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>
						<Link to={`/blog/${post.slug}`}>
							<h2 className="mb-4 font-bold text-3xl text-foreground leading-tight transition-colors hover:text-arctic-blue md:text-5xl">
								{post.title}
							</h2>
						</Link>
						<p className="mb-6 line-clamp-2 text-muted-foreground md:text-lg">
							{post.description}
						</p>
						<Link
							className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							to={`/blog/${post.slug}`}
						>
							Read Article
						</Link>
					</div>
				</div>
			))}

			{/* Controls */}
			<button
				className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-background/20 p-2 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/40 group-hover:opacity-100"
				onClick={prev}
				type="button"
			>
				<ChevronLeft size={24} />
			</button>
			<button
				className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-background/20 p-2 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/40 group-hover:opacity-100"
				onClick={next}
				type="button"
			>
				<ChevronRight size={24} />
			</button>

			{/* Dots */}
			<div className="absolute right-6 bottom-6 z-20 flex gap-2">
				{posts.map((post, i) => (
					<button
						className={cn(
							'h-2 w-2 rounded-full transition-all',
							i === current
								? 'w-6 bg-arctic-blue'
								: 'bg-muted-foreground/50 hover:bg-foreground'
						)}
						key={post.title}
						onClick={() => setCurrent(i)}
						type="button"
					/>
				))}
			</div>
		</div>
	);
}
