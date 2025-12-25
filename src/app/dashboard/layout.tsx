import { DashboardHeader } from "@/components/layout";
import { Sidebar } from "@/components/layout/";
import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, ClubProvider, QueryProvider, ThemeProvider } from "@/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
		<html lang="en" suppressHydrationWarning className="min-h-screen relative font-sans bg-base-300">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-white text-base-content`}>
				<ThemeProvider>
					<AuthProvider>
						<ClubProvider>
							<QueryProvider>
								{/* Main Layout Container */}

								{/* <div className="grid">
									<div>
										<DashboardHeader />
									</div>
									<div>
										<Sidebar />
									</div>
									<div>
										<main className="flex-1 w-full relative min-h-0 overflow-y-auto bg-base-200 rounded-2xl">{children}</main>
									</div>
								</div> */}

								<div className="flex h-screen sm:p-4 gap-6 overflow-hidden">
									<div className="hidden sm:block w-auto shrink-0 z-40">
										<Sidebar />
									</div>
									<div className="flex-1 flex flex-col min-w-0 min-h-0">
										<DashboardHeader />
										<main className="flex-1 w-full relative min-h-0 overflow-y-auto bg-base-200 rounded-2xl">{children}</main>
									</div>
								</div>
							</QueryProvider>
						</ClubProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
