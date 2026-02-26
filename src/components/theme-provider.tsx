import { createContext, type ReactNode, useContext, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
	setTheme: (theme: Theme) => void;
	theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
	children,
	attribute = 'class',
	defaultTheme = 'system',
}: {
	children: ReactNode;
	attribute?: string;
	defaultTheme?: Theme;
	disableTransitionOnChange?: boolean;
	enableSystem?: boolean;
}) {
	const [theme, setTheme] = useLocalStorageState<Theme>('theme', {
		defaultValue: defaultTheme,
	});

	useEffect(() => {
		const root = document.documentElement;
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		const effectiveTheme = theme === 'system' ? systemTheme : theme;

		if (attribute === 'class') {
			root.classList.remove('light', 'dark');
			root.classList.add(effectiveTheme);
		}
	}, [theme, attribute]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
}
