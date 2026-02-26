'use client';

import {
	BarChart3,
	BookOpen,
	Building,
	ChevronLeft,
	ChevronRight,
	Cpu,
	DollarSign,
	Handshake,
	Info,
	Mail,
	Network,
	Scale,
	Search,
	Server,
	Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchUI } from '@/components/search/SearchUI';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

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
	{ href: '/policies', label: 'Policies', icon: Scale },
	{ href: '/about', label: 'About Us', icon: Info },
];

function isNavItemActive(pathname: string, href: string): boolean {
	if (pathname === href) {
		return true;
	}

	return pathname.startsWith(`${href}/`);
}

export function Sidebar() {
	// Default to collapsed on mobile users, maybe expanded on large?
	// For now, defaulting to collapsed is safer for hydration matches or simple logic.
	// We can use a media query effect to auto-expand on huge screens if needed,
	// but user specifically requested "collapsed by default" on mobile.
	const [collapsed, setCollapsed] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const location = useLocation();
	const pathname = location.pathname;

	const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null);

	// Auto-collapse on route change on mobile
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setCollapsed(true);
				return;
			}

			setCollapsed(false);
		};

		// Initial check
		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Close on navigation if on mobile
	const handleLinkClick = () => {
		if (window.innerWidth < 768) {
			setCollapsed(true);
		}
		setTooltip(null);
	};

	const handleMouseEnter = (e: React.MouseEvent, label: string) => {
		if (!collapsed) {
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		setTooltip({ label, y: rect.top + rect.height / 2 });
	};

	const handleMouseLeave = () => {
		setTooltip(null);
	};

	// Hide sidebar on login page
	if (pathname === '/login') {
		return null;
	}

	return (
		<aside
			className={cn(
				'fixed top-0 left-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out md:relative',
				collapsed ? 'w-16' : 'w-64 shadow-2xl md:shadow-none'
			)}
		>
			{/* Header / Logo */}
			<div className="relative flex h-16 w-full items-center overflow-hidden border-b px-4">
				<Link
					aria-label="Home"
					className="flex h-full w-full items-center justify-center"
					to="/"
				>
					{/* Full Logo (Visible when Expanded) */}
					<div
						className={cn(
							'absolute top-1/2 left-4 h-10 w-40 origin-left -translate-y-1/2 transition-all duration-300 ease-in-out',
							collapsed
								? 'pointer-events-none -translate-x-4 scale-90 opacity-0'
								: 'translate-x-0 scale-100 opacity-100 delay-100' // Delay appearing to let width expand first
						)}
					>
						<img
							alt="Hot Aisle"
							className="h-full w-full object-contain"
							height={40}
							src="/hotaisle-logo.svg"
							width={200}
						/>
					</div>

					{/* Icon Only (Visible when Collapsed) */}
					<div
						className={cn(
							'absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out',
							collapsed
								? 'rotate-0 scale-100 opacity-100 delay-100' // Delay appearing to let width collapse
								: 'pointer-events-none -rotate-90 scale-50 opacity-0'
						)}
					>
						<img
							alt="Hot Aisle"
							className="h-full w-full object-contain"
							height={32}
							src="/hotaisle-icon.svg"
							width={32}
						/>
					</div>
				</Link>

				{/* Toggle Button */}
				<button
					className={cn(
						'flex rounded-md p-1 transition-colors hover:bg-accent',
						collapsed ? 'hidden' : 'ml-auto'
					)}
					onClick={() => setCollapsed(!collapsed)}
					type="button"
				>
					<ChevronLeft size={16} />
				</button>
			</div>

			{/* Better Toggle for Collapsed State */}
			{collapsed && (
				<button
					className="absolute top-4 right-[-12px] z-50 hidden rounded-full border bg-background p-0.5 shadow-md hover:bg-accent md:flex"
					onClick={() => setCollapsed(false)}
					title="Expand Sidebar"
					type="button"
				>
					<ChevronRight size={14} />
				</button>
			)}

			{/* Mobile Toggle Trigger */}
			<div
				className={cn(
					'flex justify-center border-b px-2 py-2 md:hidden',
					collapsed ? 'flex' : 'hidden'
				)}
			>
				<button
					className="rounded-md p-2 hover:bg-accent"
					onClick={() => setCollapsed(!collapsed)}
					type="button"
				>
					{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
				</button>
			</div>

			{/* Navigation */}
			<nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-4">
				{NAV_ITEMS.map((item) => {
					const isActive = isNavItemActive(pathname, item.href);
					const Icon = item.icon;

					return (
						<Link
							className={cn(
								'group relative flex items-center rounded-md px-3 py-2 font-medium text-base transition-colors hover:bg-hot-orange/10 hover:text-hot-orange',
								isActive
									? 'bg-hot-orange/10 font-bold text-hot-orange'
									: 'text-muted-foreground',
								collapsed ? 'justify-center px-2' : ''
							)}
							key={item.href}
							onClick={handleLinkClick}
							onMouseEnter={(e) => handleMouseEnter(e, item.label)}
							onMouseLeave={handleMouseLeave}
							to={item.href}
						>
							<Icon className={cn('h-5 w-5 shrink-0', collapsed ? 'mr-0' : 'mr-3')} />
							{!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div
				className={cn(
					'shrink-0 border-t bg-card/50 backdrop-blur-sm',
					collapsed ? 'flex flex-col items-center gap-4 p-2 py-4' : 'p-4'
				)}
			>
				{collapsed ? (
					<>
						<button
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange"
							onClick={() => setIsSearchOpen(true)}
							onMouseEnter={(e) => handleMouseEnter(e, 'Search')}
							onMouseLeave={handleMouseLeave}
							type="button"
						>
							<Search size={20} />
						</button>
						<Link
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange"
							onMouseEnter={(e) => handleMouseEnter(e, 'Contact Us')}
							onMouseLeave={handleMouseLeave}
							to="/contact"
						>
							<Mail size={20} />
						</Link>
						<ThemeToggle />
					</>
				) : (
					<div className="flex items-end justify-between">
						<div className="flex gap-2">
							<ThemeToggle />
							<button
								className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-hot-orange/10 hover:text-hot-orange"
								onClick={() => setIsSearchOpen(true)}
								title="Search Site"
								type="button"
							>
								<Search size={20} />
							</button>
						</div>
						<div className="flex flex-col items-end">
							<Link
								className="group/link mb-1 flex items-center gap-1 font-medium text-sm transition-colors hover:text-hot-orange"
								to="/contact"
							>
								Say hello
								<ChevronRight
									className="-ml-2 text-hot-orange opacity-0 transition-all duration-300 group-hover/link:ml-0 group-hover/link:opacity-100"
									size={12}
								/>
							</Link>
							<span className="text-[10px] text-muted-foreground opacity-50">
								© {new Date().getFullYear()} Hot Aisle
							</span>
						</div>
					</div>
				)}
			</div>

			<SearchUI isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

			{/* Fixed Tooltip Portal */}
			{tooltip && collapsed && (
				<div
					className="fade-in slide-in-from-left-2 pointer-events-none fixed left-18 z-100 animate-in whitespace-nowrap rounded-md border border-hot-orange/20 bg-neutral-900 px-3 py-1.5 font-semibold text-white text-xs shadow-xl duration-200"
					style={{ top: tooltip.y, transform: 'translateY(-50%)' }}
				>
					{tooltip.label}
					{/* Arrow */}
					<div className="absolute top-1/2 left-0 h-0 w-0 -translate-x-1.25 -translate-y-1/2 border-t-[5px] border-t-transparent border-r-[5px] border-r-neutral-900 border-b-[5px] border-b-transparent" />
				</div>
			)}
		</aside>
	);
}
