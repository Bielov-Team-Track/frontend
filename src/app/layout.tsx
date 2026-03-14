import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, QueryProvider, ThemeProvider } from "@/providers";
import { FeedbackButton } from "@/components/features/feedback";
import { DevImpersonator } from "@/components/features/dev/DevImpersonator";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://volleyspike.app"),
	title: {
		default: "Spike - Volleyball Community Platform",
		template: "%s | Spike",
	},
	description: "Connect with volleyball players, organize events, manage clubs, and track your progress.",
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "Spike",
	},
	twitter: {
		card: "summary_large_image",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inter.variable} min-h-screen relative bg-surface`}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<ThemeScript />
				<JsonLd
					data={{
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Spike",
						url: "https://volleyspike.app",
						logo: "https://volleyspike.app/icon.png",
						description: "Volleyball community platform for organizing events and managing teams",
					}}
				/>
			</head>
			<body className="font-sans min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-accent-foreground text-foreground">
				<ThemeProvider>
					<AuthProvider>
						<QueryProvider>
							{children}
							<FeedbackButton />
							<DevImpersonator />
							<Toaster position="top-center" richColors />
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
