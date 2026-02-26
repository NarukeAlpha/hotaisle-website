import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import JsonLd from '@/components/seo/JsonLd';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<Sidebar />
					<main className="relative w-full flex-1 overflow-y-auto pl-16 md:pl-0">
						<JsonLd />
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
