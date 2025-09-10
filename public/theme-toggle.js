document.addEventListener('DOMContentLoaded', function () {
	const themeToggle = document.querySelector('.theme-toggle');
	const html = document.documentElement;
	const storageKey = 'theme-preference';

	// Get initial theme from localStorage or system preference
	function getInitialTheme() {
		const saved = localStorage.getItem(storageKey);
		if (saved) return saved;

		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	}

	// Apply theme to document and toggle animation
	function setTheme(theme) {
		// Set data-theme attribute for your CSS
		html.setAttribute('data-theme', theme);

		// Toggle the animation class for toggles.dev
		if (theme === 'dark') {
			themeToggle.classList.add('theme-toggle--toggled');
		} else {
			themeToggle.classList.remove('theme-toggle--toggled');
		}

		// Update aria-label for accessibility
		themeToggle.setAttribute(
			'aria-label',
			`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`,
		);

		// Save to localStorage
		localStorage.setItem(storageKey, theme);
	}

	// Set initial theme
	const initialTheme = getInitialTheme();
	setTheme(initialTheme);

	// Handle toggle click
	themeToggle.addEventListener('click', function () {
		const currentTheme = html.getAttribute('data-theme');
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
	});

	// Listen for system theme changes (optional)
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', function (e) {
			// Only auto-switch if user hasn't manually set a preference
			if (!localStorage.getItem(storageKey)) {
				setTheme(e.matches ? 'dark' : 'light');
			}
		});
});
