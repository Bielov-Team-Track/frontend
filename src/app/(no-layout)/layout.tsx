import { ThemeScript } from "@/components/ui/theme-script";
import { QueryProvider, ThemeProvider } from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Spike",
	description: "",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="min-h-screen relative">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body
				className={`${inter.className} min-h-screen-safe flex flex-col text-mobile-base sm:text-tablet-base lg:text-desktop-base antialiased bg-background text-foreground`}>
				<ThemeProvider>
					<QueryProvider>
						<div className="min-h-screen-safe grid bg-background">
							<main className="relative w-full">{children}</main>
						</div>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
