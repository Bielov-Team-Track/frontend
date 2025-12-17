import { DashboardHeader, ReactQueryProvider } from "@/components/layout";
import { Sidebar } from "@/components/layout/";
import { AuthProvider } from "@/lib/auth/authContext";
import { ClubProvider } from "@/lib/club/ClubContext";
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
		<html
			lang="en"
			data-theme="mainTheme"
			className="min-h-screen relative bg-background-dark text-background-content font-sans">
			<Head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>
			</Head>
			<body
				className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-white`}>
				<AuthProvider>
					<ClubProvider>
						<ReactQueryProvider>
							{/* Main Layout Container */}
							<div className="flex h-screen sm:p-4 gap-6 overflow-hidden">
								{/* Sidebar (Sticky) */}
								<div className="hidden sm:block w-auto shrink-0 z-40">
									<Sidebar />
								</div>

								{/* Main Content Area */}
								<div className="flex-1 flex flex-col min-w-0 min-h-0">
									<DashboardHeader />
									<main className="flex-1 w-full relative min-h-0 overflow-y-auto">
										{children}
									</main>
								</div>
							</div>
						</ReactQueryProvider>
					</ClubProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
