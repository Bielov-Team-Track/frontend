"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const savedTheme = localStorage.getItem("theme") as Theme | null;
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

		setThemeState(initialTheme);
		applyTheme(initialTheme);
	}, []);

	const applyTheme = (newTheme: Theme) => {
		const root = document.documentElement;
		if (newTheme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	};

	const setTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem("theme", newTheme);
		applyTheme(newTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	}, [theme, setTheme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
