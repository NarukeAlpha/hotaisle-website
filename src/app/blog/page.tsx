'use client';

import { useEffect, useState } from 'react';
import { BlogIndex } from '@/components/blog/BlogIndex';
import { type BlogPost, getAllBlogPosts } from '@/lib/content';

export default function BlogPage() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		async function loadPosts() {
			const blogPosts = await getAllBlogPosts();
			if (mounted) {
				setPosts(blogPosts);
				setLoading(false);
			}
		}
		loadPosts().catch(() => {
			if (mounted) {
				setLoading(false);
			}
		});
		return () => {
			mounted = false;
		};
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto min-h-screen px-6 py-8 md:py-12">
			<div className="mb-12">
				<h1 className="mb-4 font-extrabold text-4xl tracking-tight md:text-5xl">Blog</h1>
				<p className="text-muted-foreground text-xl">
					Latest news and updates from Hot Aisle
				</p>
			</div>

			<BlogIndex posts={posts} />
		</div>
	);
}
