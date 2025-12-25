export function ThemeScript() {
	const themeScript = `
		(function() {
			try {
				const savedTheme = localStorage.getItem('theme');
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = savedTheme || (prefersDark ? 'volleydark' : 'volleylight');
				document.documentElement.setAttribute('data-theme', theme);
			} catch (e) {
				document.documentElement.setAttribute('data-theme', 'volleydark');
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
