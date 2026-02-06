"use client";

import { DashboardShell } from "@/components/layout";
import { FeedbackButton } from "@/components/features/feedback";
import { PraiseNotification } from "@/components/features/feedback/PraiseNotification";
import type { BadgeType } from "@/components/features/feedback/BadgeDisplay";
import { ThemeScript } from "@/components/ui/theme-script";
import { AuthProvider, ClubProvider, QueryProvider, ThemeProvider } from "@/providers";
import { CreateModalsProvider } from "@/providers/CreateModalsProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { Inter } from "next/font/google";
import { useState } from "react";
import "../globals.css";
const inter = Inter({ subsets: ["latin"] });

// Note: Metadata export removed as this is now a client component
// Move metadata to a separate layout file if needed

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Global praise notification state
	const [praiseNotification, setPraiseNotification] = useState<{
		isOpen: boolean;
		badgeType: BadgeType;
		message: string;
		coachName: string;
	}>({
		isOpen: false,
		badgeType: "FirstEvent",
		message: "",
		coachName: "",
	});

	// Function to trigger praise notification (can be called from anywhere in the app)
	// In production, this would be triggered by WebSocket events or API responses
	const showPraise = (badgeType: BadgeType, message: string, coachName: string) => {
		setPraiseNotification({
			isOpen: true,
			badgeType,
			message,
			coachName,
		});
	};

	return (
		<html lang="en" suppressHydrationWarning className="min-h-screen relative font-sans bg-surface">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<title>Spike</title>
				<ThemeScript />
			</head>
			<body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-accent/30 selection:text-white text-foreground`}>
				<ThemeProvider>
					<AuthProvider>
						<ClubProvider>
							<QueryProvider>
								<NotificationProvider>
									<CreateModalsProvider>
										<DashboardShell>{children}</DashboardShell>
										{/* Beta Feedback Button */}
										<FeedbackButton />
										{/* Global Praise Notification */}
										<PraiseNotification
											isOpen={praiseNotification.isOpen}
											onClose={() => setPraiseNotification((prev) => ({ ...prev, isOpen: false }))}
											badgeType={praiseNotification.badgeType}
											message={praiseNotification.message}
											coachName={praiseNotification.coachName}
										/>
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
