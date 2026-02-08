import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, QueryProvider, ThemeProvider } from "@/providers";
import { FeedbackButton } from "@/components/features/feedback";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Spike", description: "" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inter.variable} min-h-screen relative bg-surface`}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
			</head>
			<body className="font-sans min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-accent-foreground text-foreground">
				<ThemeProvider>
					<AuthProvider>
						<QueryProvider>
							{children}
							<FeedbackButton />
							<Toaster position="top-center" richColors />
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
