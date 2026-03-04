import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import JsonLd from '@/components/seo/JsonLd';
import './globals.css';

export const metadata = {
	title: 'Hot Aisle - AMD Exclusive AI Cloud',
	description:
		'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.',
	metadataBase: new URL('https://hotaisle.xyz'),
	openGraph: {
		title: 'Hot Aisle - AMD Exclusive AI Cloud',
		description:
			'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.',
		images: [
			{
				alt: 'Hot Aisle',
				height: 630,
				url: '/hotaisle-logo.png',
				width: 1200,
			},
		],
		siteName: 'Hot Aisle',
		type: 'website',
		url: 'https://hotaisle.xyz',
	},
	twitter: {
		card: 'summary_large_image',
		description:
			'AMD Exclusive AI Cloud. Deploy MI300X and MI355X GPUs in 60 seconds. $1.99/GPU/hr. No contracts, no commitments, no drama.',
		images: ['/hotaisle-logo.png'],
		title: 'Hot Aisle - AMD Exclusive AI Cloud',
	},
	icons: {
		icon: '/assets/branding/hotaisle-favicon.svg',
		shortcut: '/assets/branding/hotaisle-favicon.svg',
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body>
				<div className="flex min-h-screen bg-background text-foreground antialiased">
					<Sidebar />
					<main className="relative min-w-0 flex-1">
						<JsonLd />
						{children}
					</main>
				</div>
				<script src="/theme-toggle.js" />
			</body>
		</html>
	);
}
