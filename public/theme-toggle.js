(() => {
	const THEME_STORAGE_KEY = 'theme';
	const DARK_THEME = 'dark';
	const LIGHT_THEME = 'light';
	const TOGGLE_SELECTOR = '[data-hotaisle-theme-toggle]';

	const updateToggleLabels = () => {
		const isDark = document.documentElement.classList.contains(DARK_THEME);
		const nextTheme = isDark ? LIGHT_THEME : DARK_THEME;
		const toggleLabel = `Switch to ${nextTheme} mode`;
		const toggleButtons = document.querySelectorAll(TOGGLE_SELECTOR);

		for (const button of toggleButtons) {
			button.setAttribute('aria-label', toggleLabel);
			button.setAttribute('title', toggleLabel);
		}
	};

	const applyFallbackThemeToggle = () => {
		const root = document.documentElement;
		const isDark = root.classList.contains(DARK_THEME);
		const nextTheme = isDark ? LIGHT_THEME : DARK_THEME;

		root.classList.remove(DARK_THEME, LIGHT_THEME);
		root.classList.add(nextTheme);
		root.dataset.theme = nextTheme;

		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		} catch {
			// Ignore storage access failures in private browsing or locked-down contexts.
		}

		updateToggleLabels();
	};

	const toggleTheme = () => {
		if (typeof window.__toggleTheme === 'function') {
			window.__toggleTheme();
			updateToggleLabels();
			return;
		}

		applyFallbackThemeToggle();
	};

	document.addEventListener('click', (event) => {
		const target = event.target;

		if (
			!(
				target instanceof Element &&
				target.closest(TOGGLE_SELECTOR) instanceof HTMLButtonElement
			)
		) {
			return;
		}

		toggleTheme();
	});

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', updateToggleLabels);
	} else {
		updateToggleLabels();
	}
})();
