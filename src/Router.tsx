import { BrowserRouter, Route, Routes } from 'react-router-dom';
import About from '@/app/about/page';
import Benchmarks from '@/app/benchmarks-and-analysis/page';
import BlogPost from '@/app/blog/[slug]/page';
import Blog from '@/app/blog/page';
import Cluster from '@/app/cluster/page';
import Compute from '@/app/compute/page';
import Contact from '@/app/contact/page';
import Datacenter from '@/app/datacenter/page';
import MI300X from '@/app/mi300x/page';
import MI355X from '@/app/mi355x/page';
import Networking from '@/app/networking/page';
import NotFound from '@/app/not-found';
import Home from '@/app/page';
import Partners from '@/app/partners/page';
import PolicyDetail from '@/app/policies/[slug]/page';
import Policies from '@/app/policies/page';
import Pricing from '@/app/pricing/page';
import QuickStart from '@/app/quick-start/page';
import { Sidebar } from '@/components/layout/Sidebar';
import JsonLd from '@/components/seo/JsonLd';
import { ThemeProvider } from '@/components/theme-provider';

export function Router() {
	return (
		<BrowserRouter>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
				enableSystem
			>
				<div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
					<Sidebar />
					<main className="relative w-full flex-1 overflow-y-auto pl-16 md:pl-0">
						<JsonLd />
						<Routes>
							<Route element={<Home />} path="/" />
							<Route element={<About />} path="/about" />
							<Route element={<Benchmarks />} path="/benchmarks-and-analysis" />
							<Route element={<Blog />} path="/blog" />
							<Route element={<BlogPost />} path="/blog/:slug" />
							<Route element={<Cluster />} path="/cluster" />
							<Route element={<Compute />} path="/compute" />
							<Route element={<Contact />} path="/contact" />
							<Route element={<Datacenter />} path="/datacenter" />
							<Route element={<MI300X />} path="/mi300x" />
							<Route element={<MI355X />} path="/mi355x" />
							<Route element={<Networking />} path="/networking" />
							<Route element={<Partners />} path="/partners" />
							<Route element={<Policies />} path="/policies" />
							<Route element={<PolicyDetail />} path="/policies/:slug" />
							<Route element={<Pricing />} path="/pricing" />
							<Route element={<QuickStart />} path="/quick-start" />
							<Route element={<NotFound />} path="*" />
						</Routes>
					</main>
				</div>
			</ThemeProvider>
		</BrowserRouter>
	);
}
