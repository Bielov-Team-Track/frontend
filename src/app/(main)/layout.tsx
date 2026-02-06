import { DashboardShell } from "@/components/layout";
import { FeedbackButton } from "@/components/features/feedback";
import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, ClubProvider, QueryProvider, ThemeProvider } from "@/providers";
import { inter } from "@/lib/fonts";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "../globals.css";

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
		<html lang="en" suppressHydrationWarning className={`${inter.variable} min-h-screen relative bg-surface`}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body className="font-sans min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-accent-foreground text-foreground">
				<ThemeProvider>
					<AuthProvider>
						<ClubProvider>
							<QueryProvider>
								<DashboardShell>{children}</DashboardShell>
								<FeedbackButton />
								<Toaster position="top-center" richColors />
							</QueryProvider>
						</ClubProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
