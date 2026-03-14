import {
	BarChart3,
	BookOpen,
	Building,
	Cpu,
	DollarSign,
	Handshake,
	Info,
	Mail,
	Network,
	Scale,
	Server,
	Zap,
} from 'lucide-react';
import { AppLink } from '@/components/AppLink';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
	{ href: '/quick-start', label: 'Quick Start', icon: Zap },
	{ href: '/pricing', label: 'Pricing', icon: DollarSign },
	{ href: '/compute', label: 'Supercomputer', icon: Cpu },
	{ href: '/datacenter', label: 'Datacenter', icon: Building },
	{ href: '/networking', label: 'Networking', icon: Network },
	{ href: '/cluster', label: 'Cluster Design', icon: Server },
	{ href: '/partners', label: 'Partners', icon: Handshake },
	{ href: '/benchmarks-and-analysis', label: 'Benchmarks', icon: BarChart3 },
	{ href: '/mi300x', label: 'MI300X', icon: Cpu },
	{ href: '/mi355x', label: 'MI355X', icon: Zap },
	{ href: '/blog', label: 'Blog', icon: BookOpen },
	{ href: '/about', label: 'About Us', icon: Info },
	{ href: '/policies', label: 'Policies', icon: Scale },
];

export function Sidebar() {
	return (
		<aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card md:flex md:flex-col">
			<div className="relative flex h-16 w-full items-center border-b px-4">
				<AppLink aria-label="Home" className="flex h-full items-center" href="/">
					<div className="h-10 w-40">
						<img
							alt="Hot Aisle"
							className="h-full w-full object-contain"
							height={40}
							src="/hotaisle-logo.svg"
							width={200}
						/>
					</div>
				</AppLink>
			</div>
			<nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-4">
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;

					return (
						<AppLink
							className={cn(
								'group relative flex items-center rounded-md px-3 py-2 font-medium text-base text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange'
							)}
							href={item.href}
							key={item.href}
						>
							<Icon className="mr-3 h-5 w-5 shrink-0" />
							<span className="whitespace-nowrap">{item.label}</span>
						</AppLink>
					);
				})}
			</nav>
			<div className="shrink-0 border-t bg-card/50 p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between gap-3">
					<div className="flex gap-2">
						<AppLink
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange"
							href="/contact"
						>
							<Mail size={20} />
						</AppLink>
						<button
							aria-label="Switch to dark mode"
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange"
							data-hotaisle-theme-toggle
							title="Switch to dark mode"
							type="button"
						>
							<span aria-hidden="true">◐</span>
						</button>
					</div>
					<div className="min-w-0 flex-1 text-right">
						<span className="font-medium text-muted-foreground text-sm opacity-70">
							© 2026 Hot Aisle
						</span>
					</div>
				</div>
			</div>
		</aside>
	);
}
