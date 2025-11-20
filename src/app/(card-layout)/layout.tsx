import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ReactQueryProvider } from "@/components/layout";
import Head from "next/head";
import { AuthProvider } from "@/lib/auth/authContext";

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
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, viewport-fit=cover"
				></meta>
			</Head>
			<body
				className={`${inter.className} min-h-screen-safe flex flex-col text-mobile-base sm:text-tablet-base lg:text-desktop-base antialiased`}
			>
				<AuthProvider>
					<ReactQueryProvider>
						<div className="min-h-screen flex items-center justify-center p-4">
							<div className="w-96 relative bg-background p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
								{children}
							</div>
						</div>
					</ReactQueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
