import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, QueryProvider, ThemeProvider } from "@/providers";
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
		<html lang="en" suppressHydrationWarning className="min-h-screen relative bg-base-300">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body
				className={`${inter.className} min-h-screen-safe flex flex-col text-mobile-base sm:text-tablet-base lg:text-desktop-base antialiased bg-base-200 text-base-content`}>
				<ThemeProvider>
					<AuthProvider>
						<QueryProvider>
							<div className="min-h-screen flex items-center justify-center p-4">
								<div className="w-fit max-w-2xl relative bg-neutral-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">{children}</div>
							</div>
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
