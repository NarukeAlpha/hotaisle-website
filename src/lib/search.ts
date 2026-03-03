export interface SearchResult {
	category: 'Page' | 'Blog' | 'Policy';
	description: string;
	title: string;
	type: string;
	url: string;
}

export const STATIC_SEARCH_PAGES: SearchResult[] = [
	{
		title: 'Home',
		description: 'AMD Exclusive AI Cloud. Direct access to AMD MI300x GPUs.',
		url: '/',
		type: 'Page',
		category: 'Page',
	},
	{
		title: 'Supercomputer (Compute)',
		description: 'Dell PowerEdge XE9680 with 8x AMD MI300x GPUs.',
		url: '/compute',
		type: 'Product',
		category: 'Page',
	},
	{
		title: 'Datacenter',
		description: 'Tier 5 Platinum Secure Facilities in Grand Rapids, MI.',
		url: '/datacenter',
		type: 'Infrastructure',
		category: 'Page',
	},
	{
		title: 'Networking',
		description: '400Gbps InfiniBand Fabric & Custom Topology.',
		url: '/networking',
		type: 'Infrastructure',
		category: 'Page',
	},
	{
		title: 'Pricing',
		description: 'Transparent GPU pricing starting at $1.99/hr.',
		url: '/pricing',
		type: 'Page',
		category: 'Page',
	},
	{
		title: 'Cluster Design',
		description: 'Custom high-performance compute clusters.',
		url: '/cluster',
		type: 'Service',
		category: 'Page',
	},
	{
		title: 'Partners',
		description: 'Our ecosystem of technology partners.',
		url: '/partners',
		type: 'Page',
		category: 'Page',
	},
	{
		title: 'Quick Start Guide',
		description: 'Get up and running with Hot Aisle in 60 seconds.',
		url: '/quick-start',
		type: 'Guide',
		category: 'Page',
	},
	{
		title: 'Benchmarks',
		description: 'Performance analysis of AMD MI300x.',
		url: '/benchmarks-and-analysis',
		type: 'Research',
		category: 'Page',
	},
	{
		title: 'MI300x Details',
		description: 'Technical specifications of the AMD MI300x Accelerator.',
		url: '/mi300x',
		type: 'Hardware',
		category: 'Page',
	},
	{
		title: 'About Us',
		description: 'Our mission and company background.',
		url: '/about',
		type: 'Page',
		category: 'Page',
	},
	{
		title: 'Contact',
		description: 'Get in touch with our team.',
		url: '/contact',
		type: 'Page',
		category: 'Page',
	},
];
