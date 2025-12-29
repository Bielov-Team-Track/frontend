export function ThemeScript() {
	const themeScript = `
		(function() {
			try {
				const savedTheme = localStorage.getItem('theme');
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = savedTheme || (prefersDark ? 'dark' : 'light');
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			} catch (e) {
				document.documentElement.classList.add('dark');
			}
		})();
	`;

	return (
		<script
			dangerouslySetInnerHTML={{ __html: themeScript }}
			suppressHydrationWarning
		/>
	);
}

export default ThemeScript;
