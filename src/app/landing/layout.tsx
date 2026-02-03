import { ThemeScript } from "@/components/ui/theme-script";
import { ThemeProvider } from "@/providers";
import { inter } from "@/lib/fonts";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
	title: "Bielov Volleyer - Volleyball Community Platform",
	description:
		"Connect with volleyball players, join clubs, organize events, and track your progress. Everything your volleyball community needs in one place.",
	keywords: ["volleyball", "sports", "community", "events", "teams", "clubs", "tournaments"],
	openGraph: {
		title: "Bielov Volleyer - Volleyball Community Platform",
		description: "Connect with volleyball players, join clubs, organize events, and track your progress.",
		type: "website",
	},
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inter.variable} min-h-screen relative`}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body className="font-sans min-h-screen antialiased selection:bg-accent/30">
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
