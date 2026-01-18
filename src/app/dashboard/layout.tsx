import { DashboardShell } from "@/components/layout";
import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, ClubProvider, QueryProvider, ThemeProvider } from "@/providers";
import { CreateModalsProvider } from "@/providers/CreateModalsProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
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
								<NotificationProvider>
									<CreateModalsProvider>
										<DashboardShell>{children}</DashboardShell>
									</CreateModalsProvider>
								</NotificationProvider>
							</QueryProvider>
						</ClubProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
