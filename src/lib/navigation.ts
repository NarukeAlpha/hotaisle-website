export interface NavigationLink {
	href: string;
	label: string;
}

export const PRIMARY_NAV_LINKS: NavigationLink[] = [
	{ href: '/quick-start', label: 'Quick Start' },
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/compute', label: 'Compute' },
	{ href: '/mi300x', label: 'MI300X' },
	{ href: '/mi355x', label: 'MI355X' },
	{ href: '/blog', label: 'Blog' },
];

export const HEADER_CONTACT_LINK: NavigationLink = {
	href: '/contact',
	label: 'Contact',
};

export const HEADER_CTA_LINK: NavigationLink = {
	href: '/quick-start',
	label: 'Start Now',
};
