"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers";

const ThemeSwitcher = () => {
	const { theme, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<button className="p-2 text-muted rounded-full" aria-label="Toggle theme">
				<Sun size={20} />
			</button>
		);
	}

	return (
		<button
			onClick={toggleTheme}
			className="p-2 text-muted hover:text-white transition-colors hover:bg-white/5 rounded-full"
			aria-label={`Switch to ${theme === "volleydark" ? "light" : "dark"} mode`}
			title={`Switch to ${theme === "volleydark" ? "light" : "dark"} mode`}
		>
			{theme === "volleydark" ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
};

export default ThemeSwitcher;
