import { AppLink } from '@/components/AppLink';
import type { BlogPost } from '@/lib/content';

export function BlogHero({ posts }: { posts: BlogPost[] }) {
	const [featuredPost] = posts;
	if (!featuredPost) {
		return null;
	}

	return (
		<div className="group relative mb-12 h-125 w-full overflow-hidden rounded-xl">
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-neutral-900">
					{featuredPost.coverImage && (
						<img
							alt={featuredPost.title}
							className="h-full w-full object-cover opacity-60 transition-transform duration-2000 group-hover:scale-105"
							height={300}
							src={featuredPost.coverImage}
							width={200}
						/>
					)}
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
				</div>

				<div className="absolute bottom-0 left-0 w-full p-8 md:w-2/3 md:p-12">
					<div className="mb-4 flex gap-2">
						{featuredPost.tags?.slice(0, 2).map((tag: string) => (
							<span
								className="rounded bg-arctic-blue/20 px-2 py-1 font-bold text-arctic-blue text-xs uppercase tracking-wider"
								key={tag}
							>
								{tag}
							</span>
						))}
					</div>
					<AppLink href={`/blog/${featuredPost.slug}`}>
						<h2 className="mb-4 font-bold text-3xl text-foreground leading-tight transition-colors hover:text-arctic-blue md:text-5xl">
							{featuredPost.title}
						</h2>
					</AppLink>
					<p className="mb-6 line-clamp-2 text-muted-foreground md:text-lg">
						{featuredPost.description}
					</p>
					<AppLink
						className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						href={`/blog/${featuredPost.slug}`}
					>
						Read Article
					</AppLink>
				</div>
			</div>
		</div>
	);
}
