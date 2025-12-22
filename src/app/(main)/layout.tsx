import { Header } from "@/components/layout";
import { AuthProvider, QueryProvider } from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Volleyer",
	description: "",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" data-theme="mainTheme" className="min-h-screen relative bg-background-dark">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>
			</Head>
			<body className={`${inter.className} min-h-screen-safe flex flex-col text-mobile-base sm:text-tablet-base lg:text-desktop-base antialiased`}>
				<AuthProvider>
					<QueryProvider>
						<div className="min-h-screen-safe bg-background-dark">
							<Header />
							<main className="relative max-w-4xl mx-auto">{children}</main>
						</div>
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
