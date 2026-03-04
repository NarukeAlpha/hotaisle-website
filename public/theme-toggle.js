(() => {
	const THEME_STORAGE_KEY = 'theme';
	const DARK_THEME = 'dark';
	const LIGHT_THEME = 'light';

	const getStoredTheme = () => window.localStorage.getItem(THEME_STORAGE_KEY);

	const getPreferredTheme = () =>
		window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;

	const applyTheme = (theme) => {
		const root = document.documentElement;
		const isDark = theme === DARK_THEME;

		root.classList.toggle(DARK_THEME, isDark);

		const nextTheme = isDark ? LIGHT_THEME : DARK_THEME;
		const toggleLabel = `Switch to ${nextTheme} mode`;
		const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

		for (const button of toggleButtons) {
			button.setAttribute('aria-label', toggleLabel);
			button.setAttribute('title', toggleLabel);
		}
	};

	const resolveTheme = () => {
		const storedTheme = getStoredTheme();

		if (storedTheme === DARK_THEME || storedTheme === LIGHT_THEME) {
			return storedTheme;
		}

		return getPreferredTheme();
	};

	const setTheme = (theme) => {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
		applyTheme(theme);
	};

	const bindToggleButtons = () => {
		const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

		for (const button of toggleButtons) {
			if (!(button instanceof HTMLButtonElement) || button.dataset.themeBound === 'true') {
				continue;
			}

			button.dataset.themeBound = 'true';
			button.addEventListener('click', () => {
				const currentTheme = document.documentElement.classList.contains(DARK_THEME)
					? DARK_THEME
					: LIGHT_THEME;
				const nextTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

				setTheme(nextTheme);
			});
		}
	};

	const initializeTheme = () => {
		applyTheme(resolveTheme());
		bindToggleButtons();
	};

	initializeTheme();
	document.addEventListener('DOMContentLoaded', initializeTheme);

	const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
	const handleColorSchemeChange = (event) => {
		const storedTheme = getStoredTheme();

		if (storedTheme === DARK_THEME || storedTheme === LIGHT_THEME) {
			return;
		}

		applyTheme(event.matches ? DARK_THEME : LIGHT_THEME);
	};

	if (typeof colorScheme.addEventListener === 'function') {
		colorScheme.addEventListener('change', handleColorSchemeChange);
	} else if (typeof colorScheme.addListener === 'function') {
		colorScheme.addListener(handleColorSchemeChange);
	}
})();
