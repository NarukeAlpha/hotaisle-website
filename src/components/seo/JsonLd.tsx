const SITE_URL = 'https://hotaisle.xyz';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SERVICE_ID = `${SITE_URL}/#service`;
const LOGO_URL = `${SITE_URL}/hotaislelogofull.png`;
const DESCRIPTION =
	'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.';

const schema = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			'@id': ORGANIZATION_ID,
			name: 'Hot Aisle',
			legalName: 'Hot Aisle Inc.',
			alternateName: 'Hot Aisle',
			url: SITE_URL,
			email: 'hello@hotaisle.ai',
			logo: {
				'@type': 'ImageObject',
				url: LOGO_URL,
				'@id': `${SITE_URL}/#logo`,
			},
			image: LOGO_URL,
			description: DESCRIPTION,
			slogan: 'AMD Exclusive AI Cloud',
			foundingDate: '2023-10',
			founders: [
				{
					'@type': 'Person',
					name: 'Jon Stevens',
					jobTitle: 'Founder / CEO',
					sameAs: 'https://www.linkedin.com/in/jon-s-stevens/',
				},
				{
					'@type': 'Person',
					name: 'Clint Armstrong',
					jobTitle: 'Founder / Head of Engineering',
					sameAs: 'https://www.linkedin.com/in/clint-armstrong/',
				},
			],
			sameAs: ['https://www.linkedin.com/company/hotaisle', 'https://github.com/hotaisle'],
			contactPoint: [
				{
					'@type': 'ContactPoint',
					contactType: 'sales',
					email: 'hello@hotaisle.ai',
					availableLanguage: ['English'],
				},
				{
					'@type': 'ContactPoint',
					contactType: 'customer support',
					email: 'hello@hotaisle.ai',
					availableLanguage: ['English'],
				},
			],
			knowsAbout: [
				'AMD MI300X GPUs',
				'AMD MI355X GPUs',
				'AI Cloud Infrastructure',
				'GPU Compute',
				'High Performance Computing',
				'Bare Metal Clusters',
				'SOC 2 Type 2 Compliance',
			],
		},
		{
			'@type': 'WebSite',
			'@id': WEBSITE_ID,
			url: SITE_URL,
			name: 'Hot Aisle',
			description: DESCRIPTION,
			publisher: {
				'@id': ORGANIZATION_ID,
			},
			inLanguage: 'en-US',
		},
		{
			'@type': 'Service',
			'@id': SERVICE_ID,
			name: 'AMD Exclusive AI Cloud Compute',
			description:
				'On-demand AMD MI300X and MI355X GPU infrastructure for AI, inference, training, and HPC workloads.',
			provider: {
				'@id': ORGANIZATION_ID,
			},
			serviceType: 'GPU Cloud Infrastructure',
			hasOfferCatalog: {
				'@type': 'OfferCatalog',
				name: 'Hot Aisle Compute Services',
				itemListElement: [
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'AMD MI300X Compute',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'AMD MI355X Compute',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'AMD MI300X Bare Metal AI Clusters',
						},
					},
				],
			},
		},
	],
} as const;

export default function JsonLd() {
	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be embedded as raw script content
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
			type="application/ld+json"
		/>
	);
}
