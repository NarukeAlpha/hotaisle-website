import { BlogIndex } from '@/components/blog/BlogIndex';
import { getAllBlogPosts } from '@/lib/content';

export default function BlogPage() {
	const posts = getAllBlogPosts();

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
