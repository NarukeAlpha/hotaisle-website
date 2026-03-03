import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import JsonLd from '@/components/seo/JsonLd';
import './globals.css';

const THEME_INIT_SCRIPT = `
(() => {
	const STORAGE_KEY = 'theme';
	const DARK_CLASS = 'dark';
	const LIGHT_CLASS = 'light';

	const getStoredTheme = () => {
		try {
			return window.localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	};

	const getPreferredTheme = () => {
		const storedTheme = getStoredTheme();
		if (storedTheme === DARK_CLASS || storedTheme === LIGHT_CLASS) {
			return storedTheme;
		}

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_CLASS : LIGHT_CLASS;
	};

	const applyTheme = (theme) => {
		const root = document.documentElement;
		root.classList.remove(LIGHT_CLASS, DARK_CLASS);
		root.classList.add(theme);
		root.dataset.theme = theme;
	};

	applyTheme(getPreferredTheme());
})();
`;

const THEME_TOGGLE_SCRIPT = `
(() => {
	const STORAGE_KEY = 'theme';
	const DARK_CLASS = 'dark';
	const LIGHT_CLASS = 'light';
	const SELECTOR = '[data-theme-toggle]';

	const getStoredTheme = () => {
		try {
			return window.localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	};

	const persistTheme = (theme) => {
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {}
	};

	const getPreferredTheme = () => {
		const storedTheme = getStoredTheme();
		if (storedTheme === DARK_CLASS || storedTheme === LIGHT_CLASS) {
			return storedTheme;
		}

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_CLASS : LIGHT_CLASS;
	};

	const applyTheme = (theme) => {
		const root = document.documentElement;
		root.classList.remove(LIGHT_CLASS, DARK_CLASS);
		root.classList.add(theme);
		root.dataset.theme = theme;

		const nextTheme = theme === DARK_CLASS ? LIGHT_CLASS : DARK_CLASS;
		for (const button of document.querySelectorAll(SELECTOR)) {
			button.setAttribute('aria-label', 'Switch to ' + nextTheme + ' mode');
			button.setAttribute('title', 'Switch to ' + nextTheme + ' mode');
			const label = button.querySelector('[data-theme-label]');
			if (label) {
				label.textContent = theme === DARK_CLASS ? 'Dark' : 'Light';
			}
		}
	};

	const toggleTheme = () => {
		const nextTheme = document.documentElement.classList.contains(DARK_CLASS)
			? LIGHT_CLASS
			: DARK_CLASS;
		persistTheme(nextTheme);
		applyTheme(nextTheme);
	};

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}

		const button = target.closest(SELECTOR);
		if (!(button instanceof HTMLButtonElement)) {
			return;
		}

		toggleTheme();
	});

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const syncPreferredTheme = () => {
		if (getStoredTheme() === null) {
			applyTheme(getPreferredTheme());
		}
	};

	if (typeof mediaQuery.addEventListener === 'function') {
		mediaQuery.addEventListener('change', syncPreferredTheme);
	} else if (typeof mediaQuery.addListener === 'function') {
		mediaQuery.addListener(syncPreferredTheme);
	}

	applyTheme(getPreferredTheme());
})();
`;

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
		<html className="light" lang="en">
			<head>
				<script>{THEME_INIT_SCRIPT}</script>
			</head>
			<body>
				<div className="flex min-h-screen bg-background text-foreground antialiased">
					<Sidebar />
					<main className="relative min-w-0 flex-1">
						<JsonLd />
						{children}
					</main>
				</div>
				<script>{THEME_TOGGLE_SCRIPT}</script>
			</body>
		</html>
	);
}
